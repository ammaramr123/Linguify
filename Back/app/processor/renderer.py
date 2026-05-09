import cv2
import numpy as np
import cairo
import gi
gi.require_version('Pango', '1.0')
gi.require_version('PangoCairo', '1.0')
from gi.repository import Pango, PangoCairo


def find_best_font(text: str, w: int, h: int, base_font: str = "Sans") -> tuple[int, Pango.FontDescription]:
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
    ctx = cairo.Context(surface)

    font_map = PangoCairo.FontMap.new()
    pango_ctx = font_map.create_context()
    PangoCairo.update_context(ctx, pango_ctx)
    layout = Pango.Layout(pango_ctx)

    lo, hi = 6, 80
    best_size = lo

    while lo <= hi:
        mid = (lo + hi) // 2
        font_desc = Pango.FontDescription(f"{base_font} {mid}")
        layout.set_font_description(font_desc)
        layout.set_text(text, -1)
        layout.set_width(w * Pango.SCALE)
        layout.set_wrap(Pango.WrapMode.WORD_CHAR)

        _, text_h = layout.get_pixel_size()
        if text_h <= h:
            best_size = mid
            lo = mid + 1
        else:
            hi = mid - 1

    final_desc = Pango.FontDescription(f"{base_font} {best_size}")

    del layout, pango_ctx, font_map, ctx
    surface.finish()
    return best_size, final_desc


def get_pango_text_image(text: str, w: int, h: int) -> np.ndarray:
    font_family = "Sans"
    best_size, font_desc = find_best_font(text, w, h, base_font=font_family)

    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
    ctx = cairo.Context(surface)

    ctx.set_source_rgba(0, 0, 0, 0)
    ctx.paint()

    font_map = PangoCairo.FontMap.new()
    pango_ctx = font_map.create_context()
    PangoCairo.update_context(ctx, pango_ctx)
    layout = Pango.Layout(pango_ctx)

    layout.set_font_description(font_desc)
    layout.set_text(text, -1)
    layout.set_width(w * Pango.SCALE)
    layout.set_wrap(Pango.WrapMode.WORD_CHAR)
    layout.set_alignment(Pango.Alignment.CENTER)

    _, text_h = layout.get_pixel_size()
    start_y = max(0, (h - text_h) // 2)

    ctx.move_to(0, start_y)
    ctx.set_source_rgb(0, 0, 0)
    PangoCairo.show_layout(ctx, layout)

    buf = surface.get_data()
    render = np.ndarray(shape=(h, w, 4), dtype=np.uint8, buffer=buf)
    result = render.copy()

    del layout, pango_ctx, font_map, ctx
    surface.finish()
    return result


def overlay_arabic_text(img: np.ndarray, polygon: list, text: str) -> np.ndarray:
    poly = np.array(polygon, dtype=np.int32)
    x1, y1, w, h = cv2.boundingRect(poly)
    x2, y2 = x1 + w, y1 + h

    if w <= 0 or h <= 0:
        return img

    cv2.fillPoly(img, [poly], (255, 255, 255))

    text_overlay = get_pango_text_image(text, w, h)
    text_bgr = text_overlay[:, :, :3]
    alpha_mask = text_overlay[:, :, 3] / 255.0

    poly_mask = np.zeros((h, w), dtype=np.float32)
    shifted_poly = poly - np.array([x1, y1])
    cv2.fillPoly(poly_mask, [shifted_poly], 1.0)
    combined_alpha = alpha_mask * poly_mask

    roi = img[y1:y2, x1:x2]
    for c in range(3):
        roi[:, :, c] = roi[:, :, c] * (1 - combined_alpha) + text_bgr[:, :, c] * combined_alpha
    img[y1:y2, x1:x2] = roi

    return img


def inpaint_polygon_bbox(img: np.ndarray, polygon: list) -> np.ndarray:
    poly = np.array(polygon, dtype=np.int32)
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [poly], 255)
    return cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)


def render_translated_image(original_img: np.ndarray, text_blocks: list) -> np.ndarray:
    img = original_img.copy()
    for block in text_blocks:
        print(f"[INFO] Rendering text block with polygon {block['polygon']} and text '{block['text']}'")
        inpaint_poly = block.get("detection_polygon") or block["polygon"]
        img = inpaint_polygon_bbox(img, inpaint_poly)
        img = overlay_arabic_text(img, inpaint_poly, block["text"])
    return img