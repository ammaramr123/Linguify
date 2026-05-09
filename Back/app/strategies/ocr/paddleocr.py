import base64
import aiohttp
import cv2
import numpy as np
from app.strategies.ocr.base import OCRStrategy
from app.config import settings


class PaddleOCRAPIStrategy(OCRStrategy):
    def __init__(self):
        self.api_url = settings.ocr_api_url
        self.token = settings.ocr_api_token

    @staticmethod
    def extract_text_blocks(item: dict) -> dict | None:
        offset_x = item.get('offset_x', 0)
        offset_y = item.get('offset_y', 0)

        parsing_results = (
            item.get('text_data', {})
                .get('result', {})
                .get('layoutParsingResults', [])
        )

        all_texts = []
        all_points = []  # ✅ collect ALL polygon points from ALL blocks

        for res in parsing_results:
            for block in res.get('prunedResult', {}).get('parsing_res_list', []):
                points = block.get('block_polygon_points', [])
                text = block.get('block_content', '').replace('\n', ' ').strip()

                if not text:
                    continue

                all_texts.append(text)

                # ✅ collect every point from every block
                if points:
                    global_poly = (
                        np.array(points, dtype=np.float32)
                        + np.array([offset_x, offset_y])
                    )
                    all_points.extend(global_poly.tolist())

        if not all_texts:
            return None

        # ✅ merge all points into one bounding rectangle
        merged_polygon = None
        if all_points:
            pts = np.array(all_points, dtype=np.float32)
            x, y, w, h = cv2.boundingRect(pts.astype(np.int32))
            merged_polygon = [
                [x,     y    ],
                [x + w, y    ],
                [x + w, y + h],
                [x,     y + h]
            ]

        return {
            "text": ' '.join(all_texts),
            "polygon": merged_polygon,  # ✅ covers ALL text blocks in this crop
            "type": "text"
        }

    async def extract(self, image: np.ndarray, offset: tuple[int, int]) -> dict | None:
        _, img_encoded = cv2.imencode('.jpg', image)
        file_data = base64.b64encode(img_encoded.tobytes()).decode("ascii")

        payload = {
            "file": file_data,
            "fileType": 1,
            "useDocOrientationClassify": False,
            "useDocUnwarping": False,
            "useChartRecognition": False,
        }

        headers = {
            "Authorization": f"token {self.token}",
            "Content-Type": "application/json"
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(self.api_url, json=payload, headers=headers) as resp:
                resp.raise_for_status()
                data = await resp.json()


        return self.extract_text_blocks({
            "text_data": data,
            "offset_x": offset[0],
            "offset_y": offset[1]
        })