export default class {
	constructor(ts, data) {
		this.ts = ts;
		this.data = data;
		this.tailTs = this.data[this.data.length -1].t
	}

	combine(span) {
		if(this.ts >= span.getTailTs() && span.ts >= this.getTailTs()) {
			this.data = this.mergeData(this.data, span.data);
			this.ts = Math.max(this.ts, span.ts)
			this.tailTs = Math.min(this.getTailTs(), span.getTailTs())
			return true;
		}else{
			return false;
		}
	}

	mergeData(d1, d2) {
		let d = d1.concat(d2);
		let idList = {};
		var dd = d.filter(function (d) {
			if(idList[d.id]) {
				return false
			}else{
				idList[d.id] = true;
				return true;
			}
        });
        dd.sort(function(a, b) {
        	if(a.t > b.t) return -1;
        	else if(a.t < b.t) return 1;
        	else return 0;
        });
        return dd;
	}

	getTailTs() {
		return this.tailTs;
	}

	query(ts, limit) {
		if(this.ts >= ts) {
			let data = this.getData(ts);
			if(data.length >= limit) {
				return data.slice(0, limit);
			}
		}
		return null;
	}

	getData(ts) {
		return this.data.filter((d)=>{
			return d.t <= ts;
		});
	}
}