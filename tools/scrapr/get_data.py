import aiohttp
import asyncio
import json

pt_info_results = []
comment_results = []

async def fetch_data(sn, session):
    url_get = f"https://water.circuplus.org/app_v3/api/_points.aspx?fn=pt_info&sn={sn}"
    url_post = "https://water.circuplus.org/app_v3/api/_points.aspx"
    
    headers_get = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    }
    headers_post = {
        "Content-Type": "multipart/form-data; boundary=WebKitFormBoundaryFY6KgfarKVSxikGN",
        "User-Agent": "Mozilla/5.0",
    }
    cookies = {
        "Water": "ACC=lijason9195%40gmail.com&UID=MD2411000697&USN=316279&UNM=User-1731411359&ULV=0&UPA=&Login=2024-11-30+23%3a43%3a45",
        "Water_Log": "T=2024-11-30+23%3a43%3a45&R=",
        "_ga": "GA1.1.1408263736.1730557024",
        "_lang": "Lang=TW",
        "S_Cart": "Token=5457ead56994be674c442572cc7a581f",
        "_ga_J31D2HC7F5": "GS1.1.1732982853.7.1.1732983026.0.0.0",
    }

    # 處理 GET 請求
    try:
        async with session.get(url_get, headers=headers_get, cookies=cookies) as response:
            if response.status == 200:
                try:
                    # 解析 JSON
                    data = await response.json(content_type=None)
                    pt_info_results.append({"sn": sn, "response": data})
                    print(f"GET {sn} 成功")
                except Exception as e:
                    text_data = await response.text()
                    print(f"GET {sn} JSON 解析失敗，內容: {text_data}, 錯誤: {e}")
            else:
                print(f"GET {sn} 失敗，狀態碼: {response.status}")
    except Exception as e:
        print(f"GET {sn} 發生錯誤: {e}")

    # 處理 POST 請求
    data = (
        "--WebKitFormBoundaryFY6KgfarKVSxikGN\r\n"
        "Content-Disposition: form-data; name=\"fn\"\r\n\r\n"
        "comment\r\n"
        "--WebKitFormBoundaryFY6KgfarKVSxikGN\r\n"
        "Content-Disposition: form-data; name=\"page\"\r\n\r\n"
        "1\r\n"
        "--WebKitFormBoundaryFY6KgfarKVSxikGN\r\n"
        f"Content-Disposition: form-data; name=\"sisn\"\r\n\r\n"
        f"{sn}\r\n"
        "--WebKitFormBoundaryFY6KgfarKVSxikGN--"
    )
    try:
        async with session.post(url_post, headers=headers_post, cookies=cookies, data=data) as response:
            if response.status == 200:
                try:
                    data = await response.json(content_type=None)
                    comment_results.append({"sn": sn, "response": data})
                    print(f"POST {sn} 成功")
                except Exception as e:
                    text_data = await response.text()
                    print(f"POST {sn} JSON 解析失敗，內容: {text_data}, 錯誤: {e}")
            else:
                print(f"POST {sn} 失敗，狀態碼: {response.status}")
    except Exception as e:
        print(f"POST {sn} 發生錯誤: {e}")

async def scrape_data(sn_start, sn_end, max_concurrent_requests=5):
    semaphore = asyncio.Semaphore(max_concurrent_requests)
    count = 0

    async with aiohttp.ClientSession() as session:
        for sn in range(sn_start, sn_end + 1):
            async with semaphore:
                await fetch_data(sn, session)
                count += 1

                if count % 100 == 0:
                    print(f"已完成 {count} 筆，休息 3 秒...")
                    await asyncio.sleep(3)

    # 儲存結果到 JSON
    with open("pt_info.json", "w", encoding="utf-8") as f:
        json.dump(pt_info_results, f, ensure_ascii=False, indent=4)
    with open("comment.json", "w", encoding="utf-8") as f:
        json.dump(comment_results, f, ensure_ascii=False, indent=4)

    print("所有資料已儲存")

if __name__ == "__main__":
    asyncio.run(scrape_data(1, 28500, max_concurrent_requests=5))
