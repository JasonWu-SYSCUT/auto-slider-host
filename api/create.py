import os
import json
import uuid
from hashlib import md5
from vercel_blob import put, create_put_url

def handler(request):
    try:
        data = request.get_json()
        html = data.get("html", "")
        
        if not html.strip():
            return {"statusCode": 400, "body": json.dumps({"error": "HTML is empty"})}

        # 生成唯一文件夹名（短 + 防重）
        folder_id = str(uuid.uuid4())[:12]
        
        # 上传 index.html
        put(f"{folder_id}/index.html", html, {
            "access": "public",
            "addRandomSuffix": False
        })

        # 部署后你的域名自动就是项目名.vercel.app
        project_url = os.environ.get("VERCEL_URL", "")
        if project_url and not project_url.startswith("http"):
            project_url = "https://" + project_url
            
        full_url = f"{project_url}/{folder_id}/index.html"

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "success": true,
                "url": full_url,
                "preview": full_url.replace("/index.html", "")
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
