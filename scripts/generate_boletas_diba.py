import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from PIL import Image

def draw_boleta_diba(c, x, y, w, h, boleta_num, nums, logo_path):
    # Cores
    AZUL = colors.HexColor("#004d98")
    DORADO = colors.HexColor("#FFD700")
    DORADO_FONDO = colors.HexColor("#fef3c7")
    TEXTO_OSCURO = colors.HexColor("#0f172a")

    # 1. Fondo de la boleta con bordes redondeados
    c.saveState()
    
    # Fondo degradado o dorado elegante
    c.setFillColor(colors.HexColor("#fffbeb"))
    c.setStrokeColor(AZUL)
    c.setLineWidth(2)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=1)

    # Marco interno dorado fino
    c.setStrokeColor(DORADO)
    c.setLineWidth(1)
    c.roundRect(x + 2, y + 2, w - 4, h - 4, 6, fill=0, stroke=1)

    # 2. Logo
    logo_size = 38
    logo_x = x + 10
    logo_y = y + h - logo_size - 12
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, logo_x, logo_y, width=logo_size, height=logo_size, mask='auto', preserveAspectRatio=True)
        except Exception as e:
            c.setFillColor(AZUL)
            c.circle(logo_x + logo_size/2, logo_y + logo_size/2, logo_size/2, fill=1)
    else:
        c.setFillColor(AZUL)
        c.circle(logo_x + logo_size/2, logo_y + logo_size/2, logo_size/2, fill=1)

    # 3. Título y Serie
    content_x = logo_x + logo_size + 8
    c.setFillColor(AZUL)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(content_x, y + h - 14, "CLUB DEPORTIVO DIBA FBC")

    c.setFillColor(colors.HexColor("#b45309")) # Ámbar oscuro
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(content_x, y + h - 25, "GRAN RIFA PRO-INSCRIPCIÓN CAMPEONATO")

    # Badge número de boleta (Top Right)
    badge_w = 48
    badge_h = 16
    badge_x = x + w - badge_w - 10
    badge_y = y + h - badge_h - 10
    c.setFillColor(AZUL)
    c.roundRect(badge_x, badge_y, badge_w, badge_h, 4, fill=1, stroke=0)
    c.setFillColor(DORADO)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(badge_x + badge_w/2, badge_y + 4, f"TALÓN #{boleta_num:02d}")

    # 4. Detalles de la rifa (Columna Izquierda)
    c.setFillColor(TEXTO_OSCURO)
    detail_y = y + h - 38
    line_spacing = 10.5

    labels = [
        ("FECHA DE JUEGO:", "LUNES 2 DE NOVIEMBRE DE 2026"),
        ("SORTEO / LOTERÍA:", "SINUANO NOCHE (Últimas 2 Cifras)"),
        ("PREMIO MAYOR:", "UNA COLONIA ORIGINAL"),
        ("VALOR POR NÚMERO:", "$2.500 COP"),
    ]

    for label, val in labels:
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(AZUL)
        c.drawString(content_x, detail_y, label)
        c.setFont("Helvetica-Bold" if "PREMIO" in label or "VALOR" in label else "Helvetica", 7.5)
        c.setFillColor(colors.HexColor("#b91c1c") if "PREMIO" in label else colors.black)
        c.drawString(content_x + 92, detail_y, val)
        detail_y -= line_spacing

    # 5. Cuadrícula de números asignados (Columna Derecha)
    # 6 números en 2 filas x 3 columnas o 3 filas x 2 columnas
    grid_w = 120
    grid_h = 36
    grid_x = x + w - grid_w - 10
    grid_y = y + h - 70

    # Header de la cajita de números
    c.setFillColor(AZUL)
    c.roundRect(grid_x, grid_y + grid_h - 2, grid_w, 10, 2, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(grid_x + grid_w/2, grid_y + grid_h, "TUS NÚMEROS DE LA SUERTE")

    box_w = 36
    box_h = 15
    gap_x = 4
    gap_y = 3
    cols = 3

    for idx, num in enumerate(nums):
        col = idx % cols
        row = idx // cols
        bx = grid_x + col * (box_w + gap_x)
        by = (grid_y + grid_h - 16) - row * (box_h + gap_y)

        # Cajita blanca con borde azul
        c.setFillColor(colors.white)
        c.setStrokeColor(AZUL)
        c.setLineWidth(1)
        c.roundRect(bx, by, box_w, box_h, 3, fill=1, stroke=1)

        # Número
        c.setFillColor(AZUL)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawCentredString(bx + box_w/2, by + 3.5, str(num))

    # 6. Pie de la boleta con vendedor y comprador
    footer_y = y + 8
    footer_h = 24
    footer_w = w - 20
    footer_x = x + 10

    c.setFillColor(colors.HexColor("#f1f5f9"))
    c.setStrokeColor(colors.HexColor("#cbd5e1"))
    c.setLineWidth(0.8)
    c.roundRect(footer_x, footer_y, footer_w, footer_h, 4, fill=1, stroke=1)

    # Línea 1: Niño responsable
    c.setFillColor(AZUL)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(footer_x + 6, footer_y + 14, "VENDEDOR (NIÑO):")
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(footer_x + 95, footer_y + 14, "________________________________________________________")

    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(colors.HexColor("#0284c7"))
    c.drawRightString(footer_x + footer_w - 6, footer_y + 14, "SERIE: DIBA-FBC-2026")

    # Línea 2: Comprador y Teléfono
    c.setFillColor(AZUL)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(footer_x + 6, footer_y + 4, "COMPRADOR:")
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(footer_x + 68, footer_y + 4, "______________________________________")

    c.setFillColor(AZUL)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(footer_x + 245, footer_y + 4, "TEL:")
    c.setFont("Helvetica", 7)
    c.drawString(footer_x + 268, footer_y + 4, "_____________________")

    c.restoreState()

def generate_boletas_pdf(output_path, logo_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    page_w, page_h = letter # 612 x 792 pt

    # Parámetros: 5 boletas por página (como en la versión oficial del club)
    margin_x = 24
    margin_top = 28
    boletas_por_pagina = 5
    ticket_w = page_w - (2 * margin_x) # ~564 pt
    ticket_h = 138 # pt
    gap_y = 12

    # 100 números repartidos en 17 talonarios:
    # 16 talonarios con 6 números (96) + 1 talonario con 4 números (4) = 100 números
    total_numeros = 100
    nums_per_boleta = 6
    boletas_data = []

    curr = 0
    b_num = 1
    while curr < total_numeros:
        count = min(nums_per_boleta, total_numeros - curr)
        nums = [f"{i:02d}" for i in range(curr, curr + count)]
        boletas_data.append((b_num, nums))
        curr += count
        b_num += 1

    total_boletas = len(boletas_data)

    for i, (b_num, nums) in enumerate(boletas_data):
        pos_on_page = i % boletas_por_pagina
        if pos_on_page == 0 and i > 0:
            c.showPage()

        # Coordenada Y (desde arriba hacia abajo)
        y = page_h - margin_top - (pos_on_page + 1) * ticket_h - (pos_on_page * gap_y)

        # Dibujar boleta
        draw_boleta_diba(c, margin_x, y, ticket_w, ticket_h, b_num, nums, logo_path)

        # Línea de corte entre boletas
        if pos_on_page < boletas_por_pagina - 1 and (i + 1) < total_boletas:
            cut_y = y - (gap_y / 2)
            c.saveState()
            c.setStrokeColor(colors.HexColor("#94a3b8"))
            c.setLineWidth(0.6)
            c.setDash([3, 3])
            c.line(margin_x, cut_y, margin_x + ticket_w, cut_y)
            c.setFont("Helvetica", 6)
            c.setFillColor(colors.HexColor("#94a3b8"))
            c.drawString(margin_x + 5, cut_y + 1, "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -")
            c.restoreState()

    c.save()
    print(f"[OK] Boletas oficiales DIBA generadas en: {output_path}")

if __name__ == "__main__":
    out = r"c:\Users\INVESTIGACION 181\Desktop\DIBA\DIBA-FBC\public\Boletas_Oficiales_Rifa_DIBA_FBC.pdf"
    logo = r"c:\Users\INVESTIGACION 181\Desktop\DIBA\DIBA-FBC\public\images\ESCUDO.png"
    generate_boletas_pdf(out, logo)
