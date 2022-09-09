/**
 * This component is designed to test prerendering icons in .tsx files
 *
 *
 */

function App() {
	const count = 1;
	return (
		<div className="App">
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src="/vite.svg" className="logo" alt="Vite logo" />
				</a>
				<a href="https://reactjs.org" target="_blank"></a>
				<svg data-preserved data-icon="mdi:chevron-right"></svg>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => console.log("I was clicked!")}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</div>
	);
}

export default App;
