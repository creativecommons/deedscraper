## Copyright (c) 2007-2008 Nathan R. Yergler, John E. Doig III Creative Commons

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

from setuptools import setup, find_packages
import sys

requires = ['setuptools',
            'rdfadict',
            'web.py',
            'Jinja2',
            'decorator',
            'WebTest',
            'nose',
            'cc.i18n',
            'cc.license',
            'lxml',
            'rdflib<3.0',
            'PasteScript',
            'python-gettext<2.0',
            ]

if sys.version_info < (2, 6):
    requires.append('simplejson')

setup(
    name = "cc.deedscraper",
    version = "0.3.2",

    packages = ['cc.deedscraper'],
    namespace_packages = ['cc'],
    package_dir = {'':'src'},

    # scripts and dependencies
    dependency_links = ['http://download.zope.org/distribution/'],
    install_requires = requires,
    extras_require = {
        'fcgi': ['flup'],
        },

    entry_points = { 'console_scripts':
                         ['server = cc.deedscraper.server:serve',
                          'noop = cc.deedscraper.server:noop',
                          'scraper.fcgi = cc.deedscraper.server:fcgi',
                          'pybabel = babel.messages.frontend:main',
                          ],
                     'paste.app_factory':
                         ['deedscraper=cc.deedscraper.server:app_factory',
                          ],
                     
                     },
        
    test_suite = 'nose.collector',

    # author metadata
    author = 'Nathan R. Yergler, John E. Doig III',
    author_email = 'nathan@creativecommons.org, john@creativecommons.org',
    description = 'CCREL metadata extractor.',
    license = 'MIT',
    url = 'http://creativecommons.org/license',

    )
