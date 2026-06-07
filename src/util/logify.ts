/**
 * Helper logging function thingy
 */
export default function logify(item: any, space: number = 2): void {
	console.log('LOGIFY', JSON.stringify(item, null, space));
}
