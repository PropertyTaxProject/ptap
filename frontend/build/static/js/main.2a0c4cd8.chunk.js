(this.webpackJsonpptap_site=this.webpackJsonpptap_site||[]).push([[0],{189:function(e,t,a){e.exports=a(341)},191:function(e,t,a){},341:function(e,t,a){"use strict";a.r(t);a(190),a(191);var r=a(0),n=a.n(r),l=a(35),o=a.n(l),c=a(342),s=a(53),i=a(33),u=a(78),m=c.a.Header,p=function(){return n.a.createElement(m,null,n.a.createElement(u.a,{theme:"dark",mode:"horizontal"},n.a.createElement(u.a.Item,{key:"1"},n.a.createElement("a",{href:"/"},"Property Tax Appeal Project: Automated Appeal System"))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var h=a(348),d=a(61),f=function(){return n.a.createElement(n.a.Fragment,null,n.a.createElement("h1",null,"Welcome to the Property Tax Appeal Project's automated appeal system for Detroit, Michigan."),n.a.createElement("h2",null,"The Tax Foreclosure Crisis"),n.a.createElement("ul",null,n.a.createElement("li",null,"According to the Michigan Constitution, cities cannot assess a property at more than 50% of its market value."),n.a.createElement("li",null,"So, if your home is worth $50,000, the \u201cAssessed Value\u201d on your property tax bill cannot be more than $25,000."),n.a.createElement("li",null,"But, between 2009-2015, the City of Detroit illegally inflated the \u201cAssessed Value\u201d for\xa0",n.a.createElement("a",{href:"https://southerncalifornialawreview.com/2018/01/02/stategraft-article-by-bernadette-atuahene-timothy-r-hodge/",target:"_blank",rel:"noopener noreferrer"},"55% to 85%")," of its properties."),n.a.createElement("li",null,"In 2019, the problem continued. The City illegally inflated the \u201cAssessed Value\u201d for 84% of the lowest valued homes."),n.a.createElement("li",null,"As a result, the City has overtaxed Detroit homeowners by at least\xa0",n.a.createElement("a",{href:"https://www.detroitnews.com/story/news/local/detroit-city/housing/2020/01/09/detroit-homeowners-overtaxed-600-million/2698518001/",target:"_blank",rel:"noopener noreferrer"},"$600 million")," and one out of every 3 homes went through property tax foreclosure."),n.a.createElement("li",null,n.a.createElement("a",{href:"https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3202860",target:"_blank",rel:"noopener noreferrer"},"25% of the property tax foreclosures")," of homes lower in value would not have happened without these illegally inflated property tax assessments")),n.a.createElement("p",null,"Check out a short video below and visit the ",n.a.createElement("a",{href:"https://illegalforeclosures.org/",target:"_blank",rel:"noopener noreferrer"},"Coalition for Property Tax Justice website")," for more information!"),n.a.createElement("iframe",{title:"Illegal Foreclosures",width:"560",height:"315",src:"https://www.youtube.com/embed/J1wlRYB3p7E",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0}),n.a.createElement("h2",null,"Why Should You Appeal Your Property Tax Assessment?"),n.a.createElement("ul",null,n.a.createElement("li",null,"You can make sure that your property is correctly valued, which may lower your property taxes."),n.a.createElement("li",null,"Appealing is FREE -- our team does not charge any fee for our services!"),n.a.createElement("li",null,"Appealing takes very little time  \u2013 Our team does a lot of the leg work for you."),n.a.createElement("li",null,"It is easy \u2013 you just need to complete our short online application OR call our hotline and our team will do it for you.")),n.a.createElement("h2",null,"What is the Property Tax Appeal Project?"),n.a.createElement("ul",null,n.a.createElement("li",null,"It is a free legal service provided by the Coalition for Property Tax Justice and the University of Michigan Law School."),n.a.createElement("li",null,"Our team is here both to help you file the appeal and to understand the appeal process."),n.a.createElement("li",null,"During the 2020 appeals process, 100% of our client\u2019s appeals were successful!")),n.a.createElement(h.b,null,n.a.createElement(d.a,{type:"primary"},n.a.createElement(s.b,{to:"/detroitappeal"},"Click here to get started"))))},y=a(15),E=a(36),b=a.n(E),g=a(50),v=a(60),w=a(99),I=a.n(w),k=a(165),O=function(){var e=Object(g.a)(b.a.mark((function e(t){var a;return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,I.a.post("/api_v1/submit",t);case 3:return a=e.sent,console.log(a),e.abrupt("return",a.data.response);case 8:return e.prev=8,e.t0=e.catch(0),console.error(e.t0),e.abrupt("return",null);case 12:case"end":return e.stop()}}),e,null,[[0,8]])})));return function(t){return e.apply(this,arguments)}}(),j=function(){var e=Object(g.a)(b.a.mark((function e(t,a,r,n,l){var o,c,s;return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,o=Object(v.a)(Object(v.a)({target_pin:t,comparables:a,uuid:l},r),n),console.log(o),c=!0,e.next=6,I.a.post("/api_v1/submit2",o,{responseType:c?"blob":"json"});case 6:s=e.sent,c?Object(k.saveAs)(s.data,"".concat(r.name.split(" ").join("-").toLowerCase(),"-appeal.docx")):console.log(s),e.next=13;break;case 10:e.prev=10,e.t0=e.catch(0),console.error(e.t0);case 13:case"end":return e.stop()}}),e,null,[[0,10]])})));return function(t,a,r,n,l){return e.apply(this,arguments)}}(),P=a(90),x=a(56),C=a(345),S=a(347),A=a(121),Y={labelCol:{span:24},wrapperCol:{xs:{span:24},sm:{span:20},md:{span:18},lg:{span:14}}},F={wrapperCol:{xs:{span:24,offset:0},sm:{span:24,offset:0}}},_=function(e){var t=Object(r.useState)(!1),a=Object(y.a)(t,2),l=a[0],o=a[1],c=Object(r.useState)(!1),s=Object(y.a)(c,2),i=s[0],u=s[1];return n.a.createElement(n.a.Fragment,null,n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}},n.a.createElement("h1",null,"Homeowner Information"),n.a.createElement("p",null,"How should we contact you?"))),n.a.createElement(C.a.Item,{name:"name",label:"Full Name",rules:[{required:!0,message:"Please input your full name!"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"email",label:"Email",rules:[{required:!0,message:"Please input your Email!",type:"email"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"phone",label:"Phone Number",rules:[{required:!0,message:"Please input your phone number!"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"address",label:"Street Address",rules:[{required:!0,message:"Please input your street address!"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"city",label:"City",rules:[{required:!0,message:"Please input your city!"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"state",label:"State",rules:[{required:!0,message:"Please input your State!"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"zip",label:"Zip Code",rules:[{required:!0,message:"Please input your zip code!"}]},n.a.createElement(S.a,null)),n.a.createElement(C.a.Item,{name:"mailingsame",label:"My mailing address is the same as my street address",rules:[{required:!0,message:"Please respond!"}]},n.a.createElement(A.a.Group,{onChange:function(e){return o(e.target.value)}},n.a.createElement(A.a,{value:"Yes"},"Yes"),n.a.createElement(A.a,{value:"No"},"No"))),n.a.createElement(C.a.Item,{name:"mailingaddress",label:"Enter your Mailing Address",style:"No"===l?{display:""}:{display:"none"}},"No"===l&&n.a.createElement(S.a,{placeholder:"Please enter your mailing address"})),n.a.createElement(C.a.Item,{name:"altcontact",label:"Did someone help you fill out this form?",rules:[{required:!0,message:"Please respond!"}]},n.a.createElement(A.a.Group,{onChange:function(e){return u(e.target.value)}},n.a.createElement(A.a,{value:"Yes"},"Yes"),n.a.createElement(A.a,{value:"No"},"No"))),n.a.createElement(C.a.Item,{name:"altcontactname",label:"Enter their name",style:"Yes"===i?{display:""}:{display:"none"}},"Yes"===i&&n.a.createElement(S.a,{placeholder:"Please enter their name"})),n.a.createElement(C.a.Item,{name:"altcontactrelationship",label:"What is your relationship with them?",style:"Yes"===i?{display:""}:{display:"none"}},"Yes"===i&&n.a.createElement(S.a,{placeholder:"Please enter your relationship"})),n.a.createElement(C.a.Item,{name:"altcontactemail",label:"What is their email address?",style:"Yes"===i?{display:""}:{display:"none"}},"Yes"===i&&n.a.createElement(S.a,{placeholder:"Please enter their email"})),n.a.createElement(C.a.Item,{name:"altcontactphone",label:"What is their phone number?",style:"Yes"===i?{display:""}:{display:"none"}},"Yes"===i&&n.a.createElement(S.a,{placeholder:"Please enter their phone number"})),n.a.createElement(C.a.Item,{name:"altcontactpreferred",label:"What is their preferred contact method?",style:"Yes"===i?{display:""}:{display:"none"}},"Yes"===i&&n.a.createElement(A.a.Group,null,n.a.createElement(A.a,{value:"Phone"},"Phone"),n.a.createElement(A.a,{value:"Email"},"Email"),n.a.createElement(A.a,{value:"Both"},"Both/No Preference"))),n.a.createElement(C.a.Item,{name:"preferred",label:"What is your preferred contact method?",rules:[{required:!0,message:"Please mark your preferred method!",whitespace:!0}]},n.a.createElement(A.a.Group,null,n.a.createElement(A.a,{value:"Phone"},"Phone"),n.a.createElement(A.a,{value:"Email"},"Email"),n.a.createElement(A.a,{value:"Both"},"Both/No Preference"))),n.a.createElement(C.a.Item,{name:"heardabout",label:"How did you hear about us?"},n.a.createElement(S.a,{placeholder:"Enter how you heard about us."})))},N=function(e){var t=C.a.useForm(),a=Object(y.a)(t,1)[0],r=e.submitForm,l=e.city,o=e.pin,c=e.eligibility,s=e.uuid;return n.a.createElement(C.a,Object.assign({form:a,name:"Housing Information",onFinish:function(e){var t;"detroit"===l?t="detroit_single_family":"chicago"===l&&(t="cook_county_single_family");var a=Object(v.a)(Object(v.a)({},e),{},{pin:o,appeal_type:t,eligibility:c,uuid:s});console.log("Received values of form: ",a),r(a)},labelAlign:"left",scrollToFirstError:!0,autoComplete:"off"},Y),n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}})),n.a.createElement(C.a.Item,{noStyle:!0},n.a.createElement(_,null)),n.a.createElement(C.a.Item,F,n.a.createElement(h.b,null,n.a.createElement(d.a,{type:"danger",onClick:e.back},"Back"),n.a.createElement(d.a,{type:"primary",htmlType:"submit"},"Submit"))))},X=a(346),q=a(343),T=S.a.TextArea,B=/(\b[a-z](?!\s))/g,M={labelCol:{span:24},wrapperCol:{xs:{span:24},sm:{span:20},md:{span:18},lg:{span:14}}},D=function(e){var t=e.targetProperty,a=e.propInfo,r=e.cols,l={width:"".concat(Math.round(100/r),"%"),textAlign:"center"},o=Object.entries(t).filter((function(e){var t=Object(y.a)(e,2),a=t[0],r=t[1];return""!==a&&""!==r&&"PIN"!==a&&"Distance"!==a}));return o.sort((function(e,t){var a=Object(y.a)(e,1)[0],r=Object(y.a)(t,1)[0],n=a.toLowerCase(),l=r.toLowerCase();return n>l?1:n<l?-1:0})),n.a.createElement(n.a.Fragment,null,n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}},n.a.createElement("h1",null,"Your Property"),n.a.createElement("p",null,"Below is the data that we have on file for your property."),n.a.createElement("p",null,a),n.a.createElement("br",null))),o.map((function(e){var t=Object(y.a)(e,2),a=t[0],r=t[1];return n.a.createElement(X.a.Grid,{hoverable:!1,style:l},n.a.createElement(P.a,null,n.a.createElement("b",null,function(e){return e.replace("_"," ").replace(B,(function(e){return e.toUpperCase()}))}(a))),n.a.createElement(P.a,null,n.a.createElement("p",null,r)))})))},R=function(e){var t=e.targetProperty,a=e.propInfo,l=e.submitPropReview,o=e.back,c=C.a.useForm(),s=Object(y.a)(c,1)[0],i=Object(r.useState)(!1),u=Object(y.a)(i,2),m=u[0],p=u[1];return n.a.createElement(n.a.Fragment,null,n.a.createElement(D,{targetProperty:t,cols:5,propInfo:a}),n.a.createElement(q.a,null),n.a.createElement(C.a,Object.assign({form:s,name:"Housing Information",onFinish:function(e){console.log("Received values of form: ",e),l(e)},labelAlign:"left",scrollToFirstError:!0,autoComplete:"off"},M),n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}})),n.a.createElement(C.a.Item,{name:"validcharacteristics",rules:[{required:!0,message:"Your response is required."}],label:"Are these characteristics correct?"},n.a.createElement(A.a.Group,{onChange:function(e){return p(e.target.value)}},n.a.createElement(A.a,{value:"Yes"},"Yes"),n.a.createElement(A.a,{value:"No"},"No"))),n.a.createElement(C.a.Item,{name:"characteristicsinput",label:"What about these characteristics is incorrect?",style:"No"===m?{display:""}:{display:"none"}},"No"===m&&n.a.createElement(T,{placeholder:"Please provide as much information as you can.",rows:4})),n.a.createElement(C.a.Item,{name:"valueestimate",label:"How much do you think your house would sell for right now, as is?",rules:[{required:!0,message:"Please enter a response!"}]},n.a.createElement(S.a,{placeholder:"It is ok to enter unsure if you do not know."})),n.a.createElement(C.a.Item,null,n.a.createElement(h.b,null,n.a.createElement(d.a,{type:"danger",onClick:o},"Back"),n.a.createElement(d.a,{type:"primary",htmlType:"submit"},"Submit")))))},W=a(344),L=W.a.Column,z=/(\b[a-z](?!\s))/g,G=function(e){return e.replace("_"," ").replace(z,(function(e){return e.toUpperCase()}))},H=function(e){var t=e.comparables,a=e.headers,l=e.submitAppeal,o=e.removeComparable,c=e.back,s=t,i=Object(r.useState)(!1),u=Object(y.a)(i,2),m=u[0],p=u[1],f=a.map((function(e){return n.a.createElement(L,{title:G(e),dataIndex:e,key:e})})).sort(),E=s.map((function(e,t){return Object(v.a)({property:"Comparable ".concat(t+1)},e)}));return n.a.createElement(n.a.Fragment,null,n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}},n.a.createElement("h2",null,"Pick the 5 properties that are the most similar to your property."),n.a.createElement("p",null,"It is okay if you are unsure, your advocate will talk with you about this more. Do your best to pick the 5 properties that seem most similar to yours."),n.a.createElement("p",null,"Below is an automatically generated list of homes in your area that have recently sold. This information is part of what the City uses to determine the \u201cAssessed Value\u201d on your property tax bill. It is really important the City only consider recent home sale values of properties that are the most similar to yours."),n.a.createElement("p",null,"Delete any properties which are not comparables. The top five comparables (comparable 1 to comparable 5) will be submitted."),n.a.createElement("br",null))),n.a.createElement(W.a,{dataSource:E,loading:m,scroll:{x:!0}},n.a.createElement(L,{title:"Property",dataIndex:"property",key:"property"}),f,n.a.createElement(L,{title:"Action",key:"action",render:function(e,t){return"Your Property"===t.property?null:n.a.createElement(d.a,{danger:!0,onClick:function(){p(!0),o(Number.parseInt(t.property.split(" ")[1],10)).then((function(){p(!1)}))}},"Delete")}})),n.a.createElement(h.b,null,n.a.createElement(d.a,{type:"danger",onClick:c},"Back"),n.a.createElement(d.a,{type:"primary",onClick:l},"Review Information")))},V=function(e){var t=e.targetProperty,a=e.propInfo,r=e.cols,l={width:"".concat(Math.round(100/r),"%"),textAlign:"center"},o=Object.entries(t).filter((function(e){var t=Object(y.a)(e,2),a=t[0],r=t[1];return""!==a&&""!==r&&"PIN"!==a&&"Distance"!==a}));return o.sort((function(e,t){var a=Object(y.a)(e,1)[0],r=Object(y.a)(t,1)[0],n=a.toLowerCase(),l=r.toLowerCase();return n>l?1:n<l?-1:0})),n.a.createElement(n.a.Fragment,null,n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}},n.a.createElement("h1",null,"Your Property"),n.a.createElement("p",null,"Below is the data that we have on file for your property."),n.a.createElement("p",null,a),n.a.createElement("br",null))),o.map((function(e){var t=Object(y.a)(e,2),a=t[0],r=t[1];return n.a.createElement(X.a.Grid,{hoverable:!1,style:l},n.a.createElement(P.a,null,n.a.createElement("b",null,G(a))),n.a.createElement(P.a,null,n.a.createElement("p",null,r)))})))},U=function(e){var t=e.comparables,a=e.headers,r=e.targetProperty,l=e.propInfo,o=e.submitAppeal,c=e.removeComparable,s=e.back;return n.a.createElement(n.a.Fragment,null,n.a.createElement(V,{targetProperty:r,cols:5,propInfo:l}),n.a.createElement(q.a,null),n.a.createElement(H,{comparables:t,headers:a,removeComparable:c,submitAppeal:o,back:s}))},J=!1,$=function(){var e=Object(g.a)(b.a.mark((function e(t){return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,console.log(t),e.next=4,I.a.post("/api_v1/pin-lookup",t);case 4:return e.abrupt("return",e.sent.data.response);case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",[]);case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(t){return e.apply(this,arguments)}}(),Z=function(e){var t,a=C.a.useForm(),l=Object(y.a)(a,1)[0],o=Object(r.useState)([]),c=Object(y.a)(o,2),s=c[0],i=c[1],u=e.logPin,m=e.city,p=e.logUuid,h=e.logEligibility,f=function(e){J=!0;try{i(e.candidates),p(e.uuid)}catch(t){i([])}};"detroit"===m?t="detroit_single_family":"chicago"===m&&(t="cook_county_single_family");var E=[{title:"Address",dataIndex:"Address",key:"Address"},{title:"Pin",dataIndex:"PIN",key:"pin"},{title:"Action",key:"action",render:function(e,t){return n.a.createElement(d.a,{onClick:function(){!function(e){var t=!0;"Yes"!==l.getFieldValue("residence")?(alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Residency"),t=!1):"Yes"!==l.getFieldValue("owner")?(alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Ownership"),t=!1):!1===e.eligibility&&(alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Assessed Value"),t=!1),u(e.PIN),h(t)}(t)}},"Select")}}];return n.a.createElement(n.a.Fragment,null,n.a.createElement("h2",null,"The Process"),n.a.createElement("ul",null,n.a.createElement("li",null,"Step 1: Complete this online application by February 10, 2020. If you have any problems with the application, call our hotline or email us (",n.a.createElement("a",{href:"mailto:law-propertytax@umich.edu?subject=Request for Assistance"},"law-propertytax@umich.edu"),") and our staff can help you."),n.a.createElement("li",null,"Step 2: Once you complete the application, our team will receive a draft appeal letter."),n.a.createElement("li",null,"Step 3: Our team will call you to review the appeal letter."),n.a.createElement("li",null,"Step 4: Our team will send you a \u201cLetter of Authorization,\u201d which you must sign in order for us to represent you and send the appeal in on your behalf."),n.a.createElement("li",null,"Step 5: On February 15, 2021, our team will submit the necessary documents at the Assessor\u2019s Review (the first stage of the appeal process)."),n.a.createElement("li",null,"Step 6: On March 8, 2021, our team will file the appeal documents at the March Board of Review (the second stage of the appeal process)."),n.a.createElement("li",null,"Step 7: Sometime in March, the City will send you its decision."),n.a.createElement("li",null,"Step 8: Our team will follow up with you to discuss other housing-related resources.")),n.a.createElement("h2",null,"Am I eligible for free services?"),n.a.createElement(C.a,{form:l,name:"Pin Lookup",layout:"vertical",onFinish:function(){var e=Object(g.a)(b.a.mark((function e(a){return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=f,e.next=3,$(Object(v.a)({appeal_type:t},a));case 3:e.t1=e.sent,(0,e.t0)(e.t1);case 5:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),labelAlign:"left",scrollToFirstError:!0,autoComplete:"off"},n.a.createElement(C.a.Item,{name:"residence",rules:[{required:!0,message:"Your response is required."}],label:"Is this home your primary residence, meaning the place you live most of the year?"},n.a.createElement(A.a.Group,null,n.a.createElement(A.a,{value:"Yes"},"Yes"),n.a.createElement(A.a,{value:"No"},"No"))),n.a.createElement(C.a.Item,{name:"owner",rules:[{required:!0,message:"Your response is required."}],label:"Do you own this home?"},n.a.createElement(A.a.Group,null,n.a.createElement(A.a,{value:"Yes"},"Yes"),n.a.createElement(A.a,{value:"No"},"No"))),n.a.createElement("p",{style:{width:"350px"}},"Finally, enter your street number and street name and select your property from the table."),n.a.createElement(S.a.Group,{compact:!0},n.a.createElement(C.a.Item,{style:{width:"100px"},name:"st_num",rules:[{required:!0,message:"Street name is required."}]},n.a.createElement(S.a,{type:"number",placeholder:"number"})),n.a.createElement(C.a.Item,{style:{width:"300px"},name:"st_name",rules:[{required:!0,message:"Street name is required."}]},n.a.createElement(S.a,{placeholder:"street"}))),n.a.createElement(d.a,{type:"primary",htmlType:"submit"},"Lookup Pin")),0!==s.length?n.a.createElement(n.a.Fragment,null,n.a.createElement("br",null),n.a.createElement(W.a,{columns:E,dataSource:s})):J?"Your property could not be found. Please try searching again.":null)},Q=/(\b[a-z](?!\s))/g,K=[{title:"Name",dataIndex:"name",key:"name"},{title:"Mailing Address",dataIndex:"address",key:"address"},{title:"City",dataIndex:"city",key:"city"},{title:"Zip Code",dataIndex:"zip",key:"zip"},{title:"Preferred Contact Method",dataIndex:"preferred",key:"preferred"},{title:"Phone",dataIndex:"phone",key:"phone"},{title:"Email",dataIndex:"email",key:"email"}],ee=[{title:"Address",dataIndex:"Address",key:"Address"},{title:"Pin",dataIndex:"PIN",key:"PIN"},{title:"Assessed Value",dataIndex:"assessed_value",key:"assessed_value"},{title:"Sale Price (if available)",dataIndex:"Sale Price",key:"Sale Price"},{title:"Sale Date",dataIndex:"Sale Date",key:"Sale Date"}],te=function(e){var t=e.confirmInfo,a=e.cols,r=e.propInfo,l=e.userInfo,o=e.comparables,c=e.targetProperty,i=e.back,u={width:"".concat(Math.round(100/a),"%"),textAlign:"center"},m=Object.entries(c).filter((function(e){var t=Object(y.a)(e,2),a=t[0],r=t[1];return""!==a&&""!==r}));return m.sort((function(e,t){var a=Object(y.a)(e,1)[0],r=Object(y.a)(t,1)[0],n=a.toLowerCase(),l=r.toLowerCase();return n>l?1:n<l?-1:0})),n.a.createElement(n.a.Fragment,null,n.a.createElement(P.a,null,n.a.createElement(x.a,{xs:{span:24,offset:0},sm:{span:24,offset:0}},n.a.createElement("h1",null,"Your Appeal"),n.a.createElement("p",null,"Below is the data that we will use to construct your appeal."),n.a.createElement(h.b,null),n.a.createElement("h3",null,"Your Property Information"))),m.map((function(e){var t=Object(y.a)(e,2),a=t[0],r=t[1];return n.a.createElement(X.a.Grid,{hoverable:!1,style:u},n.a.createElement(P.a,null,n.a.createElement("b",null,function(e){return e.replace("_"," ").replace(Q,(function(e){return e.toUpperCase()}))}(a))),n.a.createElement(P.a,null,n.a.createElement("p",null,r)))})),n.a.createElement(q.a,null),n.a.createElement("h3",null,"Your Information"),n.a.createElement(W.a,{dataSource:[l],columns:K}),n.a.createElement(q.a,null),n.a.createElement("h3",null,"Your Comparables"),n.a.createElement(W.a,{dataSource:o,columns:ee}),n.a.createElement("p",null,r),n.a.createElement(d.a,{type:"danger",onClick:i},"Back"),n.a.createElement(d.a,{type:"primary",onClick:t},n.a.createElement(s.b,{to:"/completedappeal"},"Finalize Appeal")))},ae=function(e){var t=e.targetProperty,a=e.propInfo,r=e.userInfo,l=e.comparables,o=e.confirmInfo,c=e.back;return console.log(l),n.a.createElement(n.a.Fragment,null,n.a.createElement(te,{targetProperty:t,cols:5,propInfo:a,userInfo:r,comparables:l,confirmInfo:o,back:c}))},re=function(){var e=Object(g.a)(b.a.mark((function e(t,a){return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",t.filter((function(e,t){return t!==a})));case 1:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),ne=function(e){var t=e.city,a=Object(r.useState)([]),l=Object(y.a)(a,2),o=l[0],c=l[1],s=Object(r.useState)([]),i=Object(y.a)(s,2),u=i[0],m=i[1],p=Object(r.useState)(null),h=Object(y.a)(p,2),d=h[0],f=h[1],E=Object(r.useState)({}),v=Object(y.a)(E,2),w=v[0],I=v[1],k=Object(r.useState)({}),P=Object(y.a)(k,2),x=P[0],C=P[1],S=Object(r.useState)(null),A=Object(y.a)(S,2),Y=A[0],F=A[1],_=Object(r.useState)([]),X=Object(y.a)(_,2),q=X[0],T=X[1],B=Object(r.useState)([]),M=Object(y.a)(B,2),D=M[0],W=M[1],L=Object(r.useState)([]),z=Object(y.a)(L,2),G=z[0],H=z[1],V=Object(r.useState)(null),J=Object(y.a)(V,2),$=J[0],Q=J[1],K=Object(r.useState)(null),ee=Object(y.a)(K,2),te=ee[0],ne=ee[1],le=n.a.createElement(Z,{logPin:function(e){F(e)},city:t,logUuid:function(e){W(e)},logEligibility:function(e){H(e)}});return null!=Y&&(le=n.a.createElement(N,{city:t,pin:Y,uuid:D,eligibility:G,submitForm:function(){var e=Object(g.a)(b.a.mark((function e(t){var a;return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,O(t);case 2:null!=(a=e.sent)&&(I(t),c(a.comparables),m(a.labeled_headers),f(a.target_pin[0]),T(a.prop_info));case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),back:function(){I({}),F(null),c([]),m([]),f(null),T([])}})),null!=d&&(le=n.a.createElement(R,{targetProperty:d,propInfo:q,submitPropReview:function(){var e=Object(g.a)(b.a.mark((function e(t){return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:ne(!0),C(t);case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),back:function(){I({}),c([]),m([]),f(null)}})),null!=te&&(le=n.a.createElement(U,{comparables:o,headers:u,targetProperty:d,propInfo:q,submitAppeal:Object(g.a)(b.a.mark((function e(){return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:Q(!0);case 1:case"end":return e.stop()}}),e)}))),removeComparable:function(){var e=Object(g.a)(b.a.mark((function e(t){return b.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=c,e.next=3,re(o,t-1);case 3:e.t1=e.sent,(0,e.t0)(e.t1),console.log("removed ".concat(t-1));case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),back:function(){I({}),c([]),m([]),ne(null)}})),null!=$&&(le=n.a.createElement(ae,{targetProperty:d,propInfo:q,userInfo:w,comparables:o,confirmInfo:function(){j(d,o,w,x,D)},back:function(){Q(null)}})),le},le=function(){return n.a.createElement(n.a.Fragment,null,n.a.createElement("h2",null,"We currently have automated appeal systems for Detroit, Michigan and Cook County, Illinois."),n.a.createElement("p",null,"Click one of the buttons to get started with your appeal."),n.a.createElement(h.b,null,n.a.createElement(d.a,null,n.a.createElement(s.b,{to:"/detroit"},"Detroit")),n.a.createElement(d.a,null,n.a.createElement(s.b,{to:"/cook"},"Cook County"))))},oe=function(){return n.a.createElement(n.a.Fragment,null,n.a.createElement("h2",null,"Your application has now been submitted"),n.a.createElement("p",null,"What to Expect Next? Our team will contact you before the Feb. 15th deadline to complete your appeal. In the meantime, if you have any questions you can reach us at our hotline (INSERT NUMBER) or at\xa0",n.a.createElement("a",{href:"mailto:law-propertytax@umich.edu?subject=Questions after Submission"},"law-propertytax@umich.edu"),"."),n.a.createElement("ul",null,n.a.createElement("li",null," ",n.a.createElement("b",null,"\u2713 You are Here!")," Step 1: Complete this online application by February 10, 2020."),n.a.createElement("li",null,"Step 2: Once you complete the application, our team will receive a draft appeal letter."),n.a.createElement("li",null,"Step 3: Our team will call you to review the appeal letter."),n.a.createElement("li",null,"Step 4: Our team will send you a \u201cLetter of Authorization,\u201d which you must sign in order for us to represent you and send the appeal in on your behalf."),n.a.createElement("li",null,"Step 5: On February 15, 2021, our team will submit the necessary documents at the Assessor\u2019s Review (the first stage of the appeal process)."),n.a.createElement("li",null,"Step 6: On March 8, 2021, our team will file the appeal documents at the March Board of Review (the second stage of the appeal process)."),n.a.createElement("li",null,"Step 7: Sometime in March, the City will send you its decision."),n.a.createElement("li",null,"Step 8: Our team will follow up with you to discuss other housing-related resources.")),n.a.createElement(h.b,null,n.a.createElement(d.a,{type:"primary"},n.a.createElement(s.b,{to:"/illegalforeclosures"},"See more information on our website"))))},ce=c.a.Content,se=c.a.Footer,ie=function(){return n.a.createElement(s.a,null,n.a.createElement(c.a,{className:"layout"},n.a.createElement(p,null),n.a.createElement(ce,{style:{padding:"0 3vw"}},n.a.createElement("div",{className:"site-layout-content"},n.a.createElement(i.c,null,n.a.createElement(i.a,{path:"/detroit",render:function(){return n.a.createElement(f,null)}}),n.a.createElement(i.a,{path:"/detroitappeal",render:function(){return n.a.createElement(ne,{city:"detroit"})}}),n.a.createElement(i.a,{path:"/cook",render:function(){return n.a.createElement(ne,{city:"chicago"})}}),n.a.createElement(i.a,{path:"/completedappeal",render:function(){return n.a.createElement(oe,null)}}),n.a.createElement(i.a,{path:"/illegalforeclosures",component:function(){return window.location.href="https://illegalforeclosures.org/",null}}),n.a.createElement(i.a,{path:"/",render:function(){return n.a.createElement(le,null)}})))),n.a.createElement(se,{style:{textAlign:"center"}},"Property Tax Appeal Project")))};o.a.render(n.a.createElement(n.a.StrictMode,null,n.a.createElement(ie,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[189,1,2]]]);
//# sourceMappingURL=main.2a0c4cd8.chunk.js.map