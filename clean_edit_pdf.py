import fitz

def clean_edit(input_path, output_path):
    doc = fitz.open(input_path)
    
    # Page 1 Coordinates (approx 595 x 842 points for A4)
    # 2009 (Fecha Nac.): 10.5% W, 23.4% H
    # 12 (Edad): 53% W, 24.1% H
    
    # Page 2 Coordinates
    # 2009: 10.9% W, 28.9% H
    # 12: 52.5% W, 29.7% H

    def apply_fix(page, x_pct, y_pct, new_text, font_size_pct=0.018):
        width = page.rect.width
        height = page.rect.height
        
        # Center of the text
        cx = width * (x_pct / 100)
        cy = height * (y_pct / 100)
        
        # Define a rectangle for the mask (approx box around the text)
        # 4 chars for '2009', 2 chars for '12'
        box_w = width * (0.05 if len(new_text) > 2 else 0.03)
        box_h = height * 0.02
        
        rect = fitz.Rect(cx - box_w/2, cy - box_h/2, cx + box_w/2, cy + box_h/2)
        
        # Sample background color (just slightly outside the box)
        pix = page.get_pixmap(clip=fitz.Rect(cx - box_w, cy - box_h, cx - box_w + 5, cy - box_h + 5))
        color = (pix.pixel(0,0)[0]/255, pix.pixel(0,0)[1]/255, pix.pixel(0,0)[2]/255)
        
        # Draw the mask
        page.draw_rect(rect, color=color, fill=color, overlay=True)
        
        # Insert new text
        # Match font size
        fs = width * font_size_pct
        page.insert_text((cx - box_w/2, cy + box_h/4), new_text, fontsize=fs, color=(0,0,0), fontname="helv")

    # Page 1
    apply_fix(doc[0], 10.5, 23.4, "2013")
    apply_fix(doc[0], 53, 24.1, "8")
    
    # Page 2
    apply_fix(doc[1], 10.9, 28.9, "2013")
    apply_fix(doc[1], 52.5, 29.7, "8")
    
    doc.save(output_path)
    print(f"Saved to {output_path}")

input_pdf = r"C:\Users\reyna\Downloads\CamScanner 07-29-2022 08.51.pdf"
output_pdf = r"C:\Users\reyna\Downloads\Historia_Clinica_Correcta_2013.pdf"

if __name__ == "__main__":
    clean_edit(input_pdf, output_pdf)
