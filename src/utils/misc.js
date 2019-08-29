var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
		let target = x
		if(Array.isArray(key.split('.')) && key.split('.').length > 0) {
			key.split('.').forEach((k)=> target = target[k])
		}
		else {
			target = target[key]
		}
    (rv[target] = rv[target] || []).push(x);
    return rv;
  }, {});
};

export {
	groupBy
}