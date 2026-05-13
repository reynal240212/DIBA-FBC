import fitz
import os

pdf_path = r"C:\Users\reyna\Downloads\CamScanner 07-29-2022 08.51.pdf"

def analyze_full(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
        
    doc = fitz.open(path)
    print(f"Document: {path}")
    print(f"Pages: {len(doc)}")
    
    for i, page in enumerate(doc):
        print(f"\n--- Page {i+1} ---")
        text_instances_2009 = page.search_for("2009")
        text_instances_2022 = page.search_for("2022")
        
        print(f"Found '2009': {text_instances_2009}")
        print(f"Found '2022': {text_instances_2022}")
        
        # If no text found, try to find text extraction
        text = page.get_text()
        if text.strip():
            print(f"Sample text extracted: {text[:200]}...")
        else:
            print("No text layer detected by get_text().")
            
        # Check for images and their sizes
        images = page.get_images(full=True)
        print(f"Images count: {len(images)}")
        for img in images:
             print(f"  Image: {img}")

if __name__ == '__main__':
    analyze_full(pdf_path)
