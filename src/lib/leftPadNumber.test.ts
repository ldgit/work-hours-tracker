import { expect, test } from "vitest";
import { leftPadNumber } from "./leftPadNumber";

test("should do nothing for multiple-digit numbers", () => {
	expect.soft(leftPadNumber(10)).toStrictEqual("10");
	expect.soft(leftPadNumber(99)).toStrictEqual("99");
	expect.soft(leftPadNumber(123)).toStrictEqual("123");
});

test("should add a zero for singe-digit numbers", () => {
	expect.soft(leftPadNumber(1)).toStrictEqual("01");
	expect.soft(leftPadNumber(5)).toStrictEqual("05");
	expect.soft(leftPadNumber(9)).toStrictEqual("09");
});
