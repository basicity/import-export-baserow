export default {
	myVar1: [],
	myVar2: {},
	download_export () {
		download(TriggerExportWebhook.data,'export.json','json')
	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	}
}