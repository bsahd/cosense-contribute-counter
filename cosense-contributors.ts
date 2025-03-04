import * as cosense from "jsr:@cosense/std";
console.log("Page Fetch");
const pageResres = await cosense.getPage(Deno.args[0], Deno.args[1]);
if (!pageResres.ok) {
	console.log("[FATAL] Page Fetch");
	console.log("[DEBUG]Response:", pageResres);
	Deno.exit(1);
}
console.log("Create UserID Map");
const pageRes = pageResres.val;
const contributes: { name: string; id: string; contributes: number }[] = [];
contributes.push({
	id: pageRes.user.id,
	name: pageRes.user.name + "(" +
		pageRes.user.displayName + ")",
	contributes: 0,
});
contributes.push({
	id: pageRes.lastUpdateUser.id,
	name: pageRes.lastUpdateUser.name + "(" +
		pageRes.lastUpdateUser.displayName + ")",
	contributes: 0,
});

for (const element of pageRes.collaborators) {
	contributes.push({
		id: element.id,
		name: element.name + "(" + element.displayName +
			")",
		contributes: 0,
	});
}
console.log("Contributes count");
for (const element of pageRes.lines) {
	contributes.forEach((e,i)=>{
        if(e.id == element.userId){
            e.contributes += 1
        }
    })
}
console.log("output format");
console.log(contributes.toSorted((a,b)=>a.contributes-b.contributes).map((a)=>({name:a.name,contributes:a.contributes})))