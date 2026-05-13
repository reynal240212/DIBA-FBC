import fitz

def generate_grid_pdf(input_path, output_image_path):
    doc = fitz.open(input_path)
    page = doc[0]
    width = page.rect.width
    height = page.rect.height
    
    # Draw horizontal grid lines every 50 points
    for y in range(0, int(height), 20):
        page.draw_line((0, y), (width, y), color=(1, 0, 0), width=0.1)
        if y % 100 == 0:
            page.insert_text((5, y-2), str(y), fontsize=8, color=(1, 0, 0))
            
    # Draw vertical grid lines every 50 points
    for x in range(0, int(width), 20):
        page.draw_line((x, 0), (x, height), color=(0, 0, 1), width=0.1)
        if x % 100 == 0:
            page.insert_text((x+2, 10), str(x), fontsize=8, color=(0, 0, 1))

    pix = page.get_pixmap(dpi=150)
    pix.save(output_image_path)
    print(f"Grid image saved to {output_image_path}")

input_pdf = r"C:\Users\reyna\Downloads\CamScanner 07-29-2022 08.51.pdf"
grid_img = r"C:\Users\reyna\Desktop\DIBA-FBC\grid_v1.png"

if __name__ == "__main__":
    generate_grid_pdf(input_pdf, grid_img)
