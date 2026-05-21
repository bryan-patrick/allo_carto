export default function shuffleArray<T>(array: T[]) {
	let result: T[] = [];
	const arrayCopy = Array.from(array);

	while (arrayCopy.length > 0) {
		let randomIndex = Math.floor(Math.random() * arrayCopy.length);
		result.push(arrayCopy.splice(randomIndex, 1)[0]);
	}

	return result satisfies T[];
}
