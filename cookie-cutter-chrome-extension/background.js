/*
MIT License

Copyright (c) 2025 Tyrell Curry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    if (url.hostname.includes("pantheon.io")) {
      storePantheonCookies();
    } else if (isLocalSite(url)) {
      injectStoredCookies(tabId);
    }
  }
});

async function storePantheonCookies() {
  try {
    const cookies = await chrome.cookies.getAll({});
    const pantheonCookies = cookies.filter(
      (cookie) =>
        cookie.name === "X-Pantheon-Access-Token" ||
        (cookie.name === "X-Pantheon-Session" &&
          cookie.domain.includes("pantheon.io")),
    );

    if (pantheonCookies.length > 0) {
      const result = await chrome.storage.local.get(["pantheonCookies"]);
      const existingCookies = result.pantheonCookies || [];

      const cookieToString = (cookie) =>
        `${cookie.name}:${cookie.value}:${cookie.domain}`;

      const newCookieStrings = pantheonCookies.map(cookieToString).sort();
      const existingCookieStrings = existingCookies.map(cookieToString).sort();

      const areDifferent =
        JSON.stringify(newCookieStrings) !==
        JSON.stringify(existingCookieStrings);

      if (areDifferent) {
        await chrome.storage.local.remove(["pantheonCookies"]);

        await chrome.storage.local.set({ pantheonCookies: pantheonCookies });
      }
    }
  } catch (error) {}
}

function isLocalSite(url) {
  return (
    url.hostname.includes("127.") ||
    url.hostname.includes("localhost") ||
    url.protocol === "file:"
  );
}

async function injectStoredCookies(tabId) {
  try {
    const result = await chrome.storage.local.get(["pantheonCookies"]);
    if (result.pantheonCookies) {
      chrome.tabs.sendMessage(tabId, {
        action: "injectCookies",
        cookies: result.pantheonCookies,
      });
    }
  } catch (error) {}
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getCookies") {
    try {
      const cookies = await chrome.cookies.getAll({});
      const pantheonTokens = cookies.filter((cookie) =>
        cookie.name.includes("X-Pantheon"),
      );
      sendResponse({
        success: true,
        pantheonTokens: pantheonTokens,
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  }
});
