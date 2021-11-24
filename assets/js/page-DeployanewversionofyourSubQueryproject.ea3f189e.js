(window.webpackJsonp=window.webpackJsonp||[]).push([[44],{703:function(e,t,o){"use strict";o.r(t);var r=o(1),n=Object(r.a)({},(function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[o("h1",{attrs:{id:"deploy-a-new-version-of-your-subquery-project"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#deploy-a-new-version-of-your-subquery-project"}},[e._v("#")]),e._v(" Deploy a new version of your SubQuery project")]),e._v(" "),o("h2",{attrs:{id:"guidelines"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#guidelines"}},[e._v("#")]),e._v(" Guidelines")]),e._v(" "),o("p",[e._v("Although you have the freedom to always upgrade and deploy new versions of your SubQuery project, please be considerate during this process if your SubQuery project is public for the world. Some key points to note:")]),e._v(" "),o("ul",[o("li",[e._v("If your upgrade is a breaking change, either create a new project (e.g. "),o("code",[e._v("My SubQuery Project V2")]),e._v(") or give your community plenty of warning of the change through social media channels.")]),e._v(" "),o("li",[e._v("Deploying a new SubQuery project version causes some downtime as the new version indexes the complete chain from the genesis block.")])]),e._v(" "),o("h2",{attrs:{id:"deploy-changes"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#deploy-changes"}},[e._v("#")]),e._v(" Deploy Changes")]),e._v(" "),o("p",[e._v("Log into SubQuery Project and select the project you want to deploy a new version of. You can choose to either deploy to the production or staging slot. These two slots are isolated environments and each has their own databases and synchronise independently.")]),e._v(" "),o("p",[e._v("We recommend deploying to your staging slot only for final staging testing or when you need to resync your project data. You can then promote it to production with zero downtime. You will find testing is faster when "),o("RouterLink",{attrs:{to:"/run/run.html"}},[e._v("running a project locally")]),e._v(" as you can more "),o("RouterLink",{attrs:{to:"/tutorials_examples/debug-projects.html"}},[e._v("easily debug issues")]),e._v(".")],1),e._v(" "),o("p",[e._v("The staging slot is perfect for:")]),e._v(" "),o("ul",[o("li",[e._v("Final validation of changes to your SubQuery Project in a separate environment. The staging slot has a different URL to production that you can use in your dApps.")]),e._v(" "),o("li",[e._v("Warming up and indexing data for an updated SubQuery project to eliminate downtime in your dApp")]),e._v(" "),o("li",[e._v("Preparing a new release for your SubQuery Project without exposing it publicly. The staging slot is not shown to the public in the Explorer and has a unique URL that is visible only to you.")])]),e._v(" "),o("p",[o("img",{attrs:{src:"/assets/img/staging_slot.png",alt:"Staging slot"}})]),e._v(" "),o("h4",{attrs:{id:"upgrade-to-the-latest-indexer-and-query-service"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#upgrade-to-the-latest-indexer-and-query-service"}},[e._v("#")]),e._v(" Upgrade to the Latest Indexer and Query Service")]),e._v(" "),o("p",[e._v("If you just want to upgrade to the latest indexer ("),o("a",{attrs:{href:"https://www.npmjs.com/package/@subql/node",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("@subql/node")]),o("OutboundLink")],1),e._v(") or query service ("),o("a",{attrs:{href:"https://www.npmjs.com/package/@subql/query",target:"_blank",rel:"noopener noreferrer"}},[o("code",[e._v("@subql/query")]),o("OutboundLink")],1),e._v(") to take advantage of our regular performance and stability improvements, just select a newer versions of our packages and save. This will cause only a few minutes of downtime.")]),e._v(" "),o("h4",{attrs:{id:"deploy-new-version-of-your-subquery-project"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#deploy-new-version-of-your-subquery-project"}},[e._v("#")]),e._v(" Deploy New Version of your SubQuery Project")]),e._v(" "),o("p",[e._v("Fill in the Commit Hash from GitHub (copy the full commit hash) of the version of your SubQuery project codebase that you want deployed. This will cause a longer downtime depending on the time it takes to index the current chain. You can always report back here for progress.")]),e._v(" "),o("h2",{attrs:{id:"next-steps-connect-to-your-project"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#next-steps-connect-to-your-project"}},[e._v("#")]),e._v(" Next Steps - Connect to your Project")]),e._v(" "),o("p",[e._v("Once your deployment has succesfully completed and our nodes have indexed your data from the chain, you'll be able to connect to your project via the displayed GraphQL Query endpoint.")]),e._v(" "),o("p",[o("img",{attrs:{src:"/assets/img/projects-deploy-sync.png",alt:"Project being deployed and synced"}})]),e._v(" "),o("p",[e._v("Alternatively, you can click on the three dots next to the title of your project, and view it on SubQuery Explorer. There you can use the in browser playground to get started - "),o("RouterLink",{attrs:{to:"/query/query.html"}},[e._v("read more about how to user our Explorer here")]),e._v(".")],1)])}),[],!1,null,null,null);t.default=n.exports}}]);