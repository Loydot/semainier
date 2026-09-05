// petit serveur local, uniquement pour tester la PWA avant publication
const http=require("http"),fs=require("fs"),p=require("path");
const T={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".webmanifest":"application/manifest+json"};
http.createServer((q,r)=>{
  let f=decodeURIComponent(q.url.split("?")[0]);
  if(f==="/")f="/index.html";
  const c=p.join(__dirname,f);
  fs.readFile(c,(e,d)=>{
    if(e){r.writeHead(404);return r.end("404");}
    r.writeHead(200,{"Content-Type":T[p.extname(c)]||"application/octet-stream","Service-Worker-Allowed":"/"});
    r.end(d);
  });
}).listen(8123,()=>console.log("http://localhost:8123"));
