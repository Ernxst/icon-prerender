import { afterAll } from "vitest";
import { fetchMock } from "~/mocks/fetch";
import { directories } from "./directory-handler";

fetchMock.enableMocks();

afterAll(async () => {
	await Promise.all(directories.map(async (h) => h.rmdir()));
});
