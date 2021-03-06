## Copyright (c) 2010 John E. Doig III, Nathan R Yergler Creative Commons

## Permission is hereby granted, free of charge, to any person obtaining
## a copy of this software and associated documentation files (the "Software"),
## to deal in the Software without restriction, including without limitation
## the rights to use, copy, modify, merge, publish, distribute, sublicense,
## and/or sell copies of the Software, and to permit persons to whom the
## Software is furnished to do so, subject to the following conditions:

## The above copyright notice and this permission notice shall be included in
## all copies or substantial portions of the Software.

## THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
## IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
## FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
## AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
## LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
## FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
## DEALINGS IN THE SOFTWARE.

import gc
import web
import urllib2
import rdfadict
import logging

from copy import deepcopy
from decorator import decorator
from support import LOG, barf_if_not_http

from rdfadict.sink import DictSetTripleSink

__all__ = ['ScrapeRequestHandler']

FOLLOW_PREDICATES = (
     'http://www.w3.org/1999/02/22-rdf-syntax-ns#seeAlso',
     'http://rdfs.org/sioc/ns#has_owner',
     )

class TripleRedirectHandler(urllib2.HTTPRedirectHandler):
    def __init__(self, redirects, *args, **kwargs):
        self.redirects = redirects
        urllib2.HTTPRedirectHandler(*args, **kwargs)
    def http_error_301 (self, req, fp, code, msg, headers):
        self.redirects[req.get_full_url()] = headers['Location']
        return urllib2.HTTPRedirectHandler.http_error_301(
            self, req, fp, code, msg, headers)
    def http_error_302 (self, req, fp, code, msg, headers):
        self.redirects[req.get_full_url()] = headers['Location']
        return urllib2.HTTPRedirectHandler.http_error_302(
            self, req, fp, code, msg, headers)

class TripleDictSink(DictSetTripleSink):
    def __init__(self, redirects, *args, **kwargs):
        self.redirects = redirects
        super(TripleDictSink, self).__init__(*args, **kwargs)
    def triple(self, s, p, o):
        super(TripleDictSink, self).triple(s,p,o)
        # DictSetTripleSink enforces unicode
        if str(s) in self.redirects.keys():
            super(TripleDictSink, self).triple(self.redirects[str(s)],p,o)

def LogResult(log, level=logging.INFO):
    def _logging(f, *args, **kw):
        result = f(*args, **kw)
        log.log(level, result)
        return result
    return decorator(_logging)

class ScrapeRequestHandler(object):

    def _load_source(self, url, subjects=None, sink=None,
                     depth=2, redirects=None):
        barf_if_not_http(url)

        # bail out if we've hit the parsing limit
        if depth < 0:
            return sink
        
        if redirects is None:
            redirects = {}
            
        if subjects is None:
            subjects = []
        
        parser = rdfadict.RdfaParser() 

        try:
            # load the specified URL and parse the RDFa
            opener = urllib2.build_opener(TripleRedirectHandler(redirects))
            request = urllib2.Request(url)
            request.add_header('User-Agent','CC Metadata Scaper http://wiki.creativecommons.org/Metadata_Scraper')
            response = opener.open(request)
            contents = response.read()

            # default to a set-based triple sink
            if sink is None:
                sink = TripleDictSink(redirects)
            
            triples = parser.parse_string(contents, url, sink)
            
            # look for possible predicates to follow
            if url in triples.keys() and url not in subjects:
                if url in redirects.keys():
                    subjects.append(redirects[url])
                    subjects.append(url)
            
            for s in triples.keys():
                if s not in subjects:
                    subjects.append(s)
                for p in triples[s].keys():
                    if p in FOLLOW_PREDICATES:
                        # for each value of the predicate to follow
                        for o in triples[s][p]:
                            # follow if we haven't already looked here
                            if o not in subjects:
                                self._load_source(o, subjects, sink,
                                                  depth - 1, redirects)

        except Exception, e:
            triples = {'_exception': str(e)}
            
        return triples

    def _first_pass(self, url, action='triples'):
        redirects = {}
        subjects = []
        sink = TripleDictSink(redirects)

        triples = self._load_source(url=url, depth=0, sink=sink, 
                                    redirects=redirects, subjects=subjects)

        # we need to preserve the sink's rdflib types for the follows
        triples_copy = deepcopy(triples)
        triples_copy = self._process_triplesink(triples_copy)
        
        result = {}
        result['triples'] = triples_copy
        result['subjects'] = subjects
        result['redirects'] = redirects
        result['sink'] = sink

        return result

    @LogResult(LOG)
    def _triples(self, url, action='triples', depth=2,
                 sink=None, subjects=None, redirects=None):

        if subjects is None:
            subjects = []
        if redirects is None:
            redirects = {}
        
        # initialize the result
        result = dict(
            source = url,
            action = action,
            referer = web.ctx.environ.get('HTTP_REFERER', '-')
            )
        
        # parse the RDFa from the document
        triples = self._load_source(url,
                                    depth=depth,
                                    redirects=redirects,
                                    sink=sink,
                                    subjects=subjects,)

        triples = self._process_triplesink(triples)
        
        # add the triples to the result
        result['triples'] = triples
        result['subjects'] = triples.keys()
        result['redirects'] = redirects
        
        gc.collect()
        
        return result


    def _process_triplesink(self, triples):

        # post-process the Object sets into lists
        for s in triples.keys():
            if s[:1] == '_': continue

            for p in triples[s].keys():
                triples[s][p] = list(triples[s][p])
        
        ns_cc = 'http://creativecommons.org/ns#'
        ns_wr = 'http://web.resource.org/cc/'

        # mash web.resource assertions to cc.org/ns
        for s in triples.keys():

            if s[:1] == '_': continue

            # walk each predicate, checking if it's in the web.resource ns
            for p in triples[s].keys():

                if p.find(ns_wr) == 0:
                    # map this back to cc.org/ns#
                    triples[s][ns_cc + p[len(ns_wr):]] = triples[s][p]
                    del triples[s][p]
                    
        return triples
