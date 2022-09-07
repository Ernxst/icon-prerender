import { beforeEach, describe, expect, test, vi } from "vitest";
import { fetchCache, fetchSvgFromService, inFlightRequests } from "../fetch";
import { fetchMock } from "~/mocks/fetch";
import { MOCK_RESPONSE, MOCK_SVG } from "~/mocks/constants";

const ENDPOINT = "https://some-url.com";

describe.concurrent("Fetching external icons", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		fetchMock.mockClear();
		inFlightRequests.clear();
		fetchCache.clear();
	});

	test("Should cache result", async () => {
		fetchMock.mockResolvedValue(MOCK_RESPONSE.clone());
		const fetchSpy = vi.spyOn(globalThis, "fetch");
		const cacheSpy = vi.spyOn(fetchCache, "set");

		expect(fetchSpy).not.toBeCalled();

		await fetchSvgFromService(ENDPOINT);
		vi.advanceTimersByTime(2000);
		await fetchSvgFromService(ENDPOINT);

		expect(fetchSpy).toHaveBeenCalledWith(new URL(ENDPOINT));
		expect(fetchSpy).toHaveBeenCalledOnce();
		expect(cacheSpy).toHaveBeenCalledOnce();
	});

	test("Should return in flight requests instead of making a new request", async () => {
		fetchMock.mockImplementationOnce(() => {
			setTimeout(() => {}, 5000);
			return Promise.resolve(MOCK_RESPONSE.clone());
		});

		const fetchSpy = vi.spyOn(globalThis, "fetch");
		const setSpy = vi.spyOn(inFlightRequests, "set");
		const deleteSpy = vi.spyOn(inFlightRequests, "delete");

		expect(fetchSpy).not.toHaveBeenCalled();

		void fetchSvgFromService(ENDPOINT);
		vi.advanceTimersByTime(2000);

		expect(deleteSpy).not.toHaveBeenCalled();

		await fetchSvgFromService(ENDPOINT);

		expect(fetchSpy).toHaveBeenCalledWith(new URL(ENDPOINT));
		expect(fetchSpy).toHaveBeenCalledOnce();
		expect(setSpy).toHaveBeenCalledOnce();

		vi.advanceTimersByTime(5000);
		expect(deleteSpy).toHaveBeenCalledOnce();
	});

	test("Should remove completed requests from in flight cache", async () => {
		fetchMock.mockResolvedValue(MOCK_RESPONSE.clone());

		const cacheSpy = vi.spyOn(inFlightRequests, "delete");

		await fetchSvgFromService(ENDPOINT);
		expect(cacheSpy).toHaveBeenCalledOnce();
	});

	test("Should throw an error returned by the API", async () => {
		fetchMock.mockResolvedValue(
			new Response("Error!", {
				status: 500,
				statusText: "Internal Server Error",
			})
		);

		await expect(() => fetchSvgFromService(ENDPOINT)).rejects.toThrowError(
			"Error!"
		);
	});

	test("Should not allow responses without a `content-type` header", async () => {
		fetchMock.mockResolvedValue(new Response(MOCK_SVG));

		await expect(() => fetchSvgFromService(ENDPOINT)).rejects.toThrowError(
			/Unable to load SVG from/
		);
	});

	test("Should not allow responses without `svg` in the `content-type` header", async () => {
		fetchMock.mockResolvedValue(
			new Response(MOCK_SVG, {
				headers: {
					"content-type": "application/json",
				},
			})
		);

		await expect(() => fetchSvgFromService(ENDPOINT)).rejects.toThrowError(
			/Unable to load SVG from/
		);
	});
});
