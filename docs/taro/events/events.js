class Events {
    constructor(){
        this.callbacks = [];
    }
    on(eventName, callback){
        this.callbacks.push({
            eventName,
            callback,
        });
    }
    off(eventName, callback){
        this.callbacks = this.callbacks.filter((item) => {
			if(typeof eventName === 'string'){
				if(typeof callback === 'function'){
					return !(item.eventName === eventName && item.callback === callback);
				}
				return item.eventName !== eventName;
			}
			return false;
        });
    }
    trigger(eventName, ...args){
        this.callbacks.forEach((item) => {
            if(item.eventName === eventName){
                item.callback(...args);
            }
        });
    }
}

const events = new Events();

const handler = (...args) => {
	console.log('handler', ...args);
}
const handler1 = (name) => {
	console.log('handler1', name);
}
const handler2 = (name) => {
	console.log('handler2', name);
}
const handler3 = (name) => {
	console.log('handler3', name);
}

// 监听一个事件，接受参数
events.on('eventName', handler)

// 监听一个事件，接受参数
events.on('eventName1', handler)

// 监听同个事件，同时绑定多个 handler
events.on('eventName', handler1)
events.on('eventName', handler2)
events.on('eventName', handler3)
// events.off()
// 触发一个事件，传参
events.trigger('eventName', 'name')

// 触发事件，传入多个参数
// events.trigger('eventName', arg1, arg2, ...)

// 取消监听一个事件
// events.off('eventName')


// 触发一个事件，传参
events.trigger('eventName1', 'name1', 'name2')

// // 取消监听一个事件某个 handler
events.off('eventName', handler2)

// 触发一个事件，传参
events.trigger('eventName', 'name')

// // 取消监听所有事件
// events.off()

// Taro events 自行实现，可打开调试运行
// https://code.juejin.cn/pen/7404393720948195354
