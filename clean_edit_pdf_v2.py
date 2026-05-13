import fitz

def clean_edit_v2(input_path, output_path):
    doc = fitz.open(input_path)
    
    def apply_patch(page_idx, rect, new_text, font_size=10, font_name="helv"):
        page = doc[page_idx]
        
        # 1. Sample background color near the rectangle (left-top)
        pix = page.get_pixmap(clip=fitz.Rect(rect.x1 + 5, rect.y0, rect.x1 + 10, rect.y0 + 5))
        # Use simple mean color
        try:
            r_sum, g_sum, b_sum = 0, 0, 0
            for i in range(pix.width):
                for j in range(pix.height):
                    c = pix.pixel(i, j)
                    r_sum += c[0]
                    g_sum += c[1]
                    b_sum += c[2]
            n = pix.width * pix.height
            color = (r_sum/n/255, g_sum/n/255, b_sum/n/255)
        except:
            color = (1, 1, 1) # Fallback to white

        # 2. Draw mask
        page.draw_rect(rect, color=color, fill=color, overlay=True)
        
        # 3. Insert text
        # Shift y slightly for better alignment
        page.insert_text((rect.x0 + 1, rect.y1 - 3), new_text, fontsize=font_size, color=(0,0,0), fontname=font_name)

    # PAGE 1
    # 2009 -> 2013 (Fecha Nac)
    apply_patch(0, fitz.Rect(165, 200, 198, 218), "2013", font_size=11)
    # 12 -> 8 (Edad)
    apply_patch(0, fitz.Rect(522, 220, 538, 238), "8", font_size=11)
    # 12 -> 8 (Motivo Consulta) - "SE TRATA SANTIAGO 12 AÑOS"
    # The '12' is at x ~ 225, y ~ 410
    apply_patch(0, fitz.Rect(223, 403, 238, 417), "8", font_size=9)

    # PAGE 2
    # 2009 -> 2013 (Fecha Nac)
    apply_patch(1, fitz.Rect(165, 240, 198, 258), "2013", font_size=11)
    # 12 -> 8 (Edad)
    apply_patch(1, fitz.Rect(522, 260, 538, 278), "8", font_size=11)
    # 12 -> 8 (Motivo Consulta)
    # The '12' is at x ~ 225, y ~ 438
    apply_patch(1, fitz.Rect(223, 432, 238, 445), "8", font_size=9)

    doc.save(output_path)
    print(f"Professional edit saved to {output_path}")

input_pdf = r"C:\Users\reyna\Downloads\CamScanner 07-29-2022 08.51.pdf"
output_pdf = r"C:\Users\reyna\Downloads\Historia_Clinica_Santiago_2013.pdf"

if __name__ == "__main__":
    clean_edit_v2(input_pdf, output_pdf)
