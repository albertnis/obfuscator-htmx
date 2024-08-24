import { describe, it, expect } from "bun:test";
import { escapeUnsafeHtml } from "./escape";

describe("when the input contains an ampersand", () => {
  const input = `white & red`;

  it("escapes it", () => {
    const output = escapeUnsafeHtml(input);

    expect(output).toBe("white &amp; red");
  });
});

describe("when the input contains a less than sign", () => {
  const input = `white < red`;

  it("escapes it", () => {
    const output = escapeUnsafeHtml(input);

    expect(output).toBe("white &lt; red");
  });
});

describe("when the input contains a greater than sign", () => {
  const input = `white > red`;

  it("escapes it", () => {
    const output = escapeUnsafeHtml(input);

    expect(output).toBe("white &gt; red");
  });
});

describe("when the input contains quotes", () => {
  const input = `white and "red"`;

  it("escapes it", () => {
    const output = escapeUnsafeHtml(input);

    expect(output).toBe("white and &quot;red&quot;");
  });
});

describe("when the input contains a script tag", () => {
  const input = `<script>alert("rip")</script>`;

  it("escapes the characters which make up the script tag", () => {
    const output = escapeUnsafeHtml(input);

    expect(output).toBe("&lt;script&gt;alert(&quot;rip&quot;)&lt;/script&gt;");
  });
});
