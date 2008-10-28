var SIOC=function(A){return"http://rdfs.org/sioc/ns#"+A};var POWDER=function(A){return"http://www.w3.org/2007/05/powder#"+A};var DCT=function(A){return"http://purl.org/dc/terms/"+A};YAHOO.namespace("cc");YAHOO.namespace("cc.plus");YAHOO.namespace("cc.network");YAHOO.namespace("cc.attribution");function parseUri(E){var D=parseUri.options,A=D.parser[D.strictMode?"strict":"loose"].exec(E),C={},B=14;while(B--){C[D.key[B]]=A[B]||""}C[D.q.name]={};C[D.key[12]].replace(D.q.parser,function(G,F,H){if(F){C[D.q.name][F]=H}});return C}parseUri.options={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};function addQSParameter(B,C,D){var F=B;var E="";var A=(B.indexOf("#"));if(A!=-1){F=B.substring(0,A);E=B.substring(A)}F+=(B.indexOf("?")==-1)?"?":"&";F+=C+"="+D;return F+E}YAHOO.cc.network.lookup_uri=function(D,E,C){services=D[E]["http://rdfs.org/sioc/services#has_service"];if(services){for(var B=0;B<services.length;B++){if(D[services[B]]&&D[services[B]]["http://rdfs.org/sioc/services#service_protocol"]){protocols=D[services[B]]["http://rdfs.org/sioc/services#service_protocol"];for(var A=0;A<protocols.length;A++){if(protocols[A]=="http://wiki.creativecommons.org/work-lookup"){if(C){return services[B]+"?uri="+C}return services[B]}}}}}return null};YAHOO.cc.network.show_info=function(D,C,A){owner_name=D[A][SIOC("name")][0];network_url=D[A][SIOC("member_of")][0];network_name=D[network_url][DCT("title")][0];lookup_uri=YAHOO.cc.network.lookup_uri(D,network_url,C)||C;var E='<a href="'+A+'">'+owner_name+'</a> has registered <a href="'+lookup_uri+'">this work</a> at the <nobr><a href="'+network_url+'">'+network_name+"</a></nobr>.";var B=new YAHOO.widget.Module("network",{visible:true});B.setBody(E);B.render(YAHOO.util.Dom.getAncestorBy(YAHOO.util.Dom.get("work-attribution-container"),function(F){return true}));YAHOO.util.Dom.addClass(B.body,"network");B.show()};YAHOO.cc.network.match_iriset=function(C,A,B){var D=0;if(C[A][POWDER("includeregex")]){for(D=0;D<C[A][POWDER("includeregex")].length;D++){if(!(new RegExp(C[A][POWDER("includeregex")][D])).test(B)){return false}}}if(C[A][POWDER("excluderegex")]){for(D=0;D<C[A][POWDER("excluderegex")].length;D++){if((new RegExp(C[A][POWDER("excluderegex")][D])).test(B)){return false}}}return true};YAHOO.cc.network.process_metadata=function(D,C){if(D[C][SIOC("has_owner")]){owner_url=D[C][SIOC("has_owner")][0];if(D[owner_url]&&D[owner_url][SIOC("owner_of")]){for(var E=0;E<D[owner_url][SIOC("owner_of")].length;E++){var B=D[owner_url][SIOC("owner_of")][E];if(B==C){YAHOO.cc.network.show_info(D,B,owner_url)}}for(var E=0;E<D[owner_url][SIOC("owner_of")].length;E++){var B=D[owner_url][SIOC("owner_of")][E];if(YAHOO.cc.get_license(D,B)==YAHOO.cc.license_uri(null)){if(D[B][SIOC("has_parent")]&&D[D[B][SIOC("has_parent")][0]][POWDER("iriset")]){parent_url=D[B][SIOC("has_parent")][0];for(p=0;p<D[parent_url][POWDER("iriset")].length;p++){var A=D[parent_url][POWDER("iriset")][p];if(YAHOO.cc.network.match_iriset(D,A,C)){YAHOO.cc.network.show_info(D,B,owner_url)}}}}}}}};YAHOO.cc.plus.insert=function(F,E){var D=F[E]["http://creativecommons.org/ns#morePermissions"];var C=parseUri(D)["host"];var H=F[E]["http://creativecommons.org/ns#commercialLicense"]||false;var B=false;if(H){B=F[H]["http://purl.org/dc/elements/1.1/publisher"]||false;if(B){B=F[B]["http://purl.org/dc/elements/1.1/title"]||false}}var G=false;if(D){D=addQSParameter(D,"cc-referrer",document.referrer)}var A="";if(D&&C){A="<strong>Permissions beyond</strong> the scope of this public license are available at <strong><a href='";A+=D;A+="'>"+C+"</a></strong>.</li>"}if(H&&B){if(A){A+="<br/>"}A+="<strong>Commerciële Rechten</strong>. ";A+="Licenties voor commercieel gebruik zijn via";A+=' <strong><a href="'+H+'">';A+=B+"</a></strong> verkrijgbaar."}if(A){document.getElementById("more-container").innerHTML=A;document.getElementById("more-container").setAttribute("class","license more")}if(document.getElementById("nc-more-container")&&G){document.getElementById("nc-more-container").innerHTML=G}};YAHOO.cc.attribution.add_details=function(C,B){var D=C[B]["http://creativecommons.org/ns#attributionName"]||false;var A=C[B]["http://creativecommons.org/ns#attributionURL"]||false;if(D&&A){document.getElementById("attribution-container").innerHTML="You must attribute this work to <strong><a href='"+A+"'>"+D+"</a></strong> (with link)."}};YAHOO.cc.attribution.add_copy_paste=function(F,E){var G=F[E]["http://creativecommons.org/ns#attributionName"]||false;var D=F[E]["http://creativecommons.org/ns#attributionURL"]||false;var A=document.getElementById("license-code").value;var C=document.getElementById("license-url").value;var B=null;if(G&&D){B='<div xmlns:cc="http://creativecommons.org/ns#" about="'+E+'"><a rel="cc:attributionURL" property="cc:attributionName" href="'+D+'">'+G+'</a> / <a rel="license" href="'+C+'">'+A+"</a></div>"}else{if(G){B='<div xmlns:cc="http://creativecommons.org/ns#" about="'+E+'"><span property="cc:attributionName">'+G+'</span> / <a rel="license" href="'+C+'">'+A+"</a></div>"}else{if(D){B='<div xmlns:cc="http://creativecommons.org/ns#" about="'+E+'"><a rel="cc:attributionURL" href="'+D+'">'+D+'</a> / <a rel="license" href="'+C+'">'+A+"</a></div>"}}}if(B!=null){document.getElementById("work-attribution").value=B;document.getElementById("work-attribution-container").style.display="block"}};YAHOO.namespace("cc.campaign");YAHOO.cc.campaign.show=function(){var C=YAHOO.util.Dom.get("header");var B='Help Build the Commons &mdash; <a href="http://support.creativecommons.org/?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008">Join Today!</a>';var A=new YAHOO.widget.Module("campaign",{visible:false});A.setBody(B);A.render(C);YAHOO.util.Dom.insertBefore(A.element,YAHOO.util.Dom.getFirstChild(C));A.show()};YAHOO.util.Event.onDOMReady(YAHOO.cc.campaign.show);YAHOO.cc.license_uri=function(A){if(A==null){A=document.URL}if(A.charAt(A.length-1)=="/"){return A}return A.substring(0,A.lastIndexOf("/")+1)};YAHOO.cc.get_license=function(B,A){if(!B[A]){return null}var C=B[A]["http://www.w3.org/1999/xhtml/vocab#license"]||B[A]["http://purl.org/dc/terms/license"]||B[A]["http://creativecommons.org/ns#license"]||null;if(C){return C[0]}return null};YAHOO.cc.success=function(A){if(A.status!=200){return }var G=A.argument;var B=YAHOO.cc.license_uri(document.URL);var E=YAHOO.lang.JSON.parse(A.responseText);var D=null;if((E.subjects.indexOf(G)>-1)&&(YAHOO.cc.get_license(E.triples,G)==B)){D=G}else{var F=[];for(var C=0;C<E.subjects.length;C++){if(YAHOO.cc.get_license(E.triples,E.subjects[C])==B){F.push(E.subjects[C])}}if(F.length==1){D=F[0]}}YAHOO.cc.network.process_metadata(E.triples,D);YAHOO.cc.plus.insert(E.triples,D);YAHOO.cc.attribution.add_details(E.triples,D);YAHOO.cc.attribution.add_copy_paste(E.triples,D)};YAHOO.cc.failure=function(){};YAHOO.cc.load=function(){if(document.referrer.match("^http://")){var B={success:YAHOO.cc.success,failure:YAHOO.cc.failure,argument:document.referrer};YAHOO.util.Connect.initHeader("Referer",document.URL,true);var A="/apps/triples?url="+encodeURIComponent(document.referrer);YAHOO.util.Connect.asyncRequest("GET",A,B,null)}};YAHOO.util.Event.onDOMReady(YAHOO.cc.load);