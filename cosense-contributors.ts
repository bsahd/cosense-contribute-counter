import main,* as mod from "./mod.ts"
if(Deno.args[1]){
console.log(main(Deno.args[0],Deno.args[1]))
}else{
mod.countProject(Deno.args[0])
}
