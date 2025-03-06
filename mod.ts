import * as cosense from "jsr:@cosense/std@0.29.9";
export type Contributes = { name: string; id: string; contributes: number }[];
import ProgressBar from "jsr:@deno-library/progress";
/** n秒待つ関数 (await忘れずに) */
function sleep(ms: number) {
	return new Promise((res) => {
		setTimeout(() => res(null), ms);
	});
}

export async function countProject(projectName: string) {
	console.log("loading page list");
	const titleList: string[] = [];
	const pagecountlist = await cosense.listPages(projectName, { limit: 1 });
	if (!pagecountlist.ok) {
		throw "res:" + pagecountlist;
	}
	const pageCount = pagecountlist.val.count;
	const pageListList: Promise<void>[] = [];
	for (let i = 0; i < Math.ceil(pageCount / 1000); i++) {
		pageListList.push(
			cosense.listPages(projectName, {
				limit: 1000,
			}).then((pageList) => {
				if (!pageList.ok) {
					throw "res:" + pageList;
				}
				for (const elem of pageList.val.pages) {
					titleList.push(elem.title);
				}
				console.log(i * 1000 + "/" + pageCount);
			}),
		);
	}
	await Promise.all(pageListList);
	const mergeArray: Contributes = [];
	const progress = new ProgressBar({
		title: "Count:",
		total: titleList.length,
	});
	await progress.render(0);
	let loaded = 0;
	let connections = 0;
	for (const elem of titleList) {
		while (connections > 63) {
			await sleep(100);
		}
		connections += 1;
		await progress.render(loaded);
		count(projectName, elem, mergeArray).then(() => {
			loaded++;
			connections -= 1;
		});
	}
	while (connections > 0) {
		await sleep(100);
	}
	console.log(JSON.stringify(mergeArray, null, "\t"));
	return mergeArray;
}
export default async function count(
	projectName: string,
	pageName: string,
	mergeArray?: Contributes,
): Promise<Contributes> {
	const pageResres = await cosense.getPage(projectName, pageName);
	if (!pageResres.ok) {
		throw "res:" + pageResres;
	}
	const pageRes = pageResres.val;
	let contributes: Contributes = [];
	if (mergeArray) {
		contributes = mergeArray;
	}
	if (contributes.filter((a) => a.id == pageRes.user.id).length == 0) {
		contributes.push({
			id: pageRes.user.id,
			name: pageRes.user.name + "(" +
				pageRes.user.displayName + ")",
			contributes: 0,
		});
	}
	if (
		contributes.filter((a) => a.id == pageRes.lastUpdateUser.id).length == 0
	) {
		contributes.push({
			id: pageRes.lastUpdateUser.id,
			name: pageRes.lastUpdateUser.name + "(" +
				pageRes.lastUpdateUser.displayName + ")",
			contributes: 0,
		});
	}
	for (const element of pageRes.collaborators) {
		if (contributes.filter((a) => a.id == element.id).length == 0) {
			contributes.push({
				id: element.id,
				name: element.name + "(" + element.displayName +
					")",
				contributes: 0,
			});
		}
	}
	for (const element of pageRes.lines) {
		contributes.forEach((e, _) => {
			if (e.id == element.userId) {
				e.contributes += element.text.length;
			}
		});
	}
	return contributes.sort((a, b) => a.contributes - b.contributes);
}
