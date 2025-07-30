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

const isPantheonSite = window.location.hostname.includes("pantheon.io");
const isLocalSite =
  window.location.hostname.includes("127.") ||
  window.location.hostname.includes("localhost") ||
  window.location.protocol === "file:";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectCookies" && isLocalSite) {
    request.cookies.forEach((cookie) => {
      let cookieString = `${cookie.name}=${cookie.value}`;
      if (cookie.path) {
        cookieString += `; path=${cookie.path}`;
      }
      document.cookie = cookieString;
    });
    sendResponse({ success: true });
  }
});
