import pypdf
import os

pdf_path = r"C:\Users\reyna\Downloads\CamScanner 07-29-2022 08.51.pdf"

def analyze_pdf(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
        
    try:
        reader = pypdf.PdfReader(path)
        print(f"Pages: {len(reader.pages)}")
        
        found_2009 = False
        has_images = False
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if "2009" in text:
                print(f"Page {i+1}: Found '2009'")
                found_2009 = True
            
            # Check for images
            if page.images:
                has_images = True
                
        if not found_2009:
            print("String '2009' not found in text layer.")
        if has_images:
            print("PDF contains images (likely a scan).")
        else:
            print("PDF seems to be text-only.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    analyze_pdf(pdf_path)
