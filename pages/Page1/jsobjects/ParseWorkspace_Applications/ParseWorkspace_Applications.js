export default {
	myVar1: [],
	myVar2: {},
	ShowWorkspacesAndApplications () {
		return GetWorkspaces.data.map(ws => {
			return {label: ws.name, value: ws.id}
		})
		//	write code here
		//	this.myVar1 = [1,2,3]
	}
}