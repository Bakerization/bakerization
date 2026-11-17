import test from "node:test";
import assert from "node:assert/strict";
import { parseArchive, archivePageCount } from "./lib/panlabo";
import { sanitizeBlogHtml } from "../lib/blog-html";
import { formatBlogDate } from "../lib/blog-format";

const entry = (date: string, more = "") => `<div class="entry"><div class="entry_title">パンの記録 &amp; 小麦</div><div class="entry_date">${date}</div><div class="entry_body"><p>原文の本文【D】</p><img src="http://img-cdn.jg.jugem.jp/c47/1342631/photo.jpg"><div class="service_button"><script>track()</script>Tweet</div></div><div class="entry_more">${more}</div><div class="entry_state"><a href="./?cid=1">パン屋</a><a href="./?eid=123#comments">comments(0)</a></div></div>`;

test("Japanese dates retain their day even when the stored UTC timestamp is the previous day", () => {
  const [post] = parseArchive(entry("2009.07.09 Thursday 00:03"), "https://panlabo.jugem.jp/?page=194");
  assert.equal(post.publishedAt, "2009-07-08T15:03:00.000Z");
  assert.equal(formatBlogDate(post.publishedAt), "2009/07/09");
  assert.equal(post.originalDate, "2009.07.09 Thursday 00:03");
  assert.equal(post.sourceUrl, "https://panlabo.jugem.jp/?eid=123");
  assert.equal(post.title, "パンの記録 & 小麦");
  assert.match(post.contentHtml, /原文の本文【D】/);
  assert.match(post.contentHtml, /https:\/\/img-cdn/);
  assert.doesNotMatch(post.contentHtml, /Tweet|track\(/);
});

test("continuation links are flagged for full-text fetching rather than imported as complete articles", () => {
  assert.equal(parseArchive(entry("2024.11.10 Sunday 16:04", '<a href="./?eid=123#sequel">続きを読む</a>'), "https://panlabo.jugem.jp/")[0].needsContinuation, true);
});

test("broken source pages or dates fail instead of assigning today's date", () => {
  assert.throws(() => parseArchive("maintenance", "https://panlabo.jugem.jp/"), /No entries/);
  assert.throws(() => parseArchive(entry("date missing"), "https://panlabo.jugem.jp/"), /Unrecognized source date/);
  assert.equal(archivePageCount('<div class="entry_navi">1/195</div>'), 195);
});

test("legacy YouTube Flash embeds retain the same movie in the modern player", () => {
  const html = entry("2013.01.01 Tuesday 12:00").replace("<p>原文の本文【D】</p>", '<object><param name="movie" value="//www.youtube.com/v/cjJfJg1u_Vo?version=3"><embed src="//www.youtube.com/v/cjJfJg1u_Vo?version=3"></object>');
  const [post] = parseArchive(html, "https://panlabo.jugem.jp/");
  assert.match(post.contentHtml, /https:\/\/www.youtube.com\/embed\/cjJfJg1u_Vo/);
  assert.doesNotMatch(post.contentHtml, /<object|<embed/);
});

test("archived markup cannot execute code, while article images and approved video embeds remain", () => {
  const clean = sanitizeBlogHtml('<script>alert(1)</script><img src="https://example.com/photo.jpg" onerror="alert(1)"><a href="javascript:alert(1)">text</a><iframe src="https://evil.example/a"></iframe><iframe src="https://www.youtube.com/embed/abc" allowfullscreen></iframe><p style="position:fixed">body</p>');
  assert.doesNotMatch(clean, /<script|onerror|javascript:|evil\.example|position:fixed/);
  assert.match(clean, /photo\.jpg/);
  assert.match(clean, /youtube\.com\/embed\/abc/);
  assert.match(clean, />body<\/p>/);
});
