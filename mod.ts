import * as cosense from "jsr:@cosense/std@0.29.9";
export default async function main(
  projectName: string,
  pageName: string,
): Promise<{ name: string; contributes: number }[]> {
  const pageResres = await cosense.getPage(projectName, pageName);
  if (!pageResres.ok) {
    throw "res:" + pageResres;
  }
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
  for (const element of pageRes.lines) {
    contributes.forEach((e, _) => {
      if (e.id == element.userId) {
        e.contributes += 1;
      }
    });
  }
  return contributes.toSorted((a, b) => a.contributes - b.contributes).map((
    a,
  ) => ({ name: a.name, contributes: a.contributes }));
}
