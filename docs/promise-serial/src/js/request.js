function request({data = {name: '若川'}, ms = 1000, isSuccess = true} = {}){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if(isSuccess){
				resolve(data);
			}
			else{
				reject(data);
			}
		}, ms);
	});
}
