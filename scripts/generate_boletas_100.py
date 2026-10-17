import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# --- CONFIGURACIÓN DE LA RIFA ---
TITULO_RIFA = "RIFA PRO-INSCRIPCIÓN CAMPEONATO"
CLUB = "CLUB DEPORTIVO DIBA FBC"
FECHA_SORTEO = "MARTES 27 DE OCTUBRE DE 2026"
LOTERIA = "SINUANO NOCHE (Últimas 2 Cifras)"
PREMIO = "UNA COLONIA ORIGINAL"
VALOR_NUMERO = "$2.500"
TOTAL_NUMEROS = 100
NUMS_POR_NINO = 6

BASE_DIR = r"c:\Users\INVESTIGACION 181\Desktop\DIBA"
REPO_DIR = os.path.join(BASE_DIR, "DIBA-FBC")
LOGO_PATH = os.path.join(REPO_DIR, "public", "images", "ESCUDO.png")

# Colores
AZUL_DIBA = colors.HexColor("#004d98")
AZUL_OSCURO = colors.HexColor("#002a54")
DORADO_DIBA = colors.HexColor("#FFD700")
DORADO_FONDO = colors.HexColor("#fffbeb")
DORADO_TEXTO = colors.HexColor("#b45309")
GRIS_TEXTO = colors.HexColor("#475569")
GRIS_BORDE = colors.HexColor("#cbd5e1")
VERDE_EXITO = colors.HexColor("#16a34a")

def generar_boletas_100_individuales(pdf_path):
    """
    Genera 100 boletas individuales (del 00 al 99) con talón desprendible.
    Cada página contiene 5 boletas (20 páginas en total).
    Cada boleta tiene:
    - Talón izquierdo para el control del vendedor (N°, Comprador, Tel, Pagó, Vendedor).
    - Línea punteada de corte ✂️.
    - Boleta derecha para el comprador (Escudo, Gran Número, Premio, Sorteo, Fecha, Valor).
    """
    c = canvas.Canvas(pdf_path, pagesize=letter)
    page_w, page_h = letter # 612 x 792 pt

    margin_x = 24
    margin_top = 26
    boletas_por_pagina = 5
    ticket_w = page_w - (2 * margin_x) # 564 pt
    ticket_h = 138 # pt
    gap_y = 12

    for num_int in range(TOTAL_NUMEROS):
        pos_on_page = num_int % boletas_por_pagina
        if pos_on_page == 0 and num_int > 0:
            c.showPage()

        y = page_h - margin_top - (pos_on_page + 1) * ticket_h - (pos_on_page * gap_y)
        num_str = f"{num_int:02d}"
        nino_asignado = (num_int // NUMS_POR_NINO) + 1

        # Marco exterior de la boleta completa
        c.saveState()
        c.setFillColor(colors.HexColor("#ffffff"))
        c.setStrokeColor(AZUL_DIBA)
        c.setLineWidth(1.8)
        c.roundRect(margin_x, y, ticket_w, ticket_h, 6, fill=1, stroke=1)

        # Divisor: TALÓN IZQUIERDO vs BOLETA DERECHA
        talon_w = 175 # ancho del talón
        cuerpo_w = ticket_w - talon_w

        # --- PARTE 1: TALÓN DESPRENDIBLE (IZQUIERDA) ---
        c.setFillColor(colors.HexColor("#f8fafc"))
        c.rect(margin_x + 1, y + 1, talon_w - 2, ticket_h - 2, fill=1, stroke=0)

        # Encabezado del talón
        c.setFillColor(AZUL_DIBA)
        c.rect(margin_x, y + ticket_h - 22, talon_w, 22, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(margin_x + talon_w/2, y + ticket_h - 11, "TALÓN DE CONTROL — DIBA FBC")
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(margin_x + talon_w/2, y + ticket_h - 19, f"TALONARIO #{nino_asignado:02d} | VALOR: {VALOR_NUMERO}")

        # Número en grande en el talón
        c.setFillColor(AZUL_DIBA)
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(margin_x + talon_w/2, y + ticket_h - 45, f"N° {num_str}")

        # Campos a rellenar en el talón
        ty = y + ticket_h - 60
        t_gap = 13.5
        c.setFillColor(colors.HexColor("#0f172a"))
        c.setFont("Helvetica-Bold", 6.5)
        
        fields = [
            ("COMPRADOR:", margin_x + 6, ty),
            ("TEL / WHATSAPP:", margin_x + 6, ty - t_gap),
            ("DIRECCIÓN:", margin_x + 6, ty - 2*t_gap),
            ("VENDEDOR (NIÑO):", margin_x + 6, ty - 3*t_gap),
        ]
        for f_label, fx, fy in fields:
            c.drawString(fx, fy, f_label)
            c.setStrokeColor(GRIS_BORDE)
            c.setLineWidth(0.6)
            c.line(fx + 62, fy - 1, margin_x + talon_w - 6, fy - 1)

        # Casilla de pagado
        chk_y = y + 8
        c.setFillColor(AZUL_DIBA)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(margin_x + 10, chk_y + 3, f"VALOR: {VALOR_NUMERO}")
        c.rect(margin_x + talon_w - 55, chk_y, 45, 12, fill=0, stroke=1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(margin_x + talon_w - 50, chk_y + 3.5, "PAGADO  [  ]")

        # --- LÍNEA DE CORTE VERTICAL ✂️ ---
        cut_x = margin_x + talon_w
        c.setStrokeColor(colors.HexColor("#94a3b8"))
        c.setLineWidth(0.8)
        c.setDash([3, 3])
        c.line(cut_x, y, cut_x, y + ticket_h)
        c.setFont("Helvetica", 6)
        c.setFillColor(colors.HexColor("#94a3b8"))
        c.saveState()
        c.translate(cut_x + 4, y + ticket_h/2 - 20)
        c.rotate(90)
        c.drawString(0, 0, "✂ - - - CORTAR AQUÍ - - -")
        c.restoreState()

        # --- PARTE 2: BOLETA PARA EL COMPRADOR (DERECHA) ---
        cuerpo_x = cut_x + 8
        cuerpo_inner_w = ticket_w - talon_w - 12

        # Fondo sutil dorado en el área del comprador
        c.setFillColor(DORADO_FONDO)
        c.roundRect(cuerpo_x, y + 4, cuerpo_inner_w, ticket_h - 8, 5, fill=1, stroke=0)

        # Escudo del club
        logo_size = 40
        logo_y = y + ticket_h - logo_size - 14
        if os.path.exists(LOGO_PATH):
            try:
                c.drawImage(LOGO_PATH, cuerpo_x + 8, logo_y, width=logo_size, height=logo_size, mask='auto', preserveAspectRatio=True)
            except Exception:
                pass

        # Encabezado club
        text_x = cuerpo_x + logo_size + 16
        c.setFillColor(AZUL_DIBA)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(text_x, y + ticket_h - 18, CLUB)

        c.setFillColor(DORADO_TEXTO)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(text_x, y + ticket_h - 29, TITULO_RIFA)

        # Badge gigante del número (Top Right)
        badge_w = 68
        badge_h = 32
        badge_x = margin_x + ticket_w - badge_w - 8
        badge_y = y + ticket_h - badge_h - 10
        c.setFillColor(AZUL_DIBA)
        c.roundRect(badge_x, badge_y, badge_w, badge_h, 5, fill=1, stroke=0)
        c.setFillColor(DORADO_DIBA)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(badge_x + badge_w/2, badge_y + badge_h - 10, "NÚMERO")
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(badge_x + badge_w/2, badge_y + 4, f"# {num_str}")

        # Datos del sorteo
        detail_y = y + ticket_h - 48
        d_spacing = 11.5

        items = [
            ("🏆 PREMIO:", PREMIO, colors.HexColor("#dc2626"), "Helvetica-Bold"),
            ("📅 JUEGA:", FECHA_SORTEO, colors.black, "Helvetica-Bold"),
            ("🎰 LOTERÍA:", LOTERIA, colors.black, "Helvetica"),
            ("💰 VALOR:", f"{VALOR_NUMERO} C/U", AZUL_DIBA, "Helvetica-Bold"),
        ]

        for lbl, val, col, fstyle in items:
            c.setFont("Helvetica-Bold", 7.5)
            c.setFillColor(AZUL_DIBA)
            c.drawString(text_x, detail_y, lbl)
            c.setFont(fstyle, 7.5)
            c.setFillColor(col)
            c.drawString(text_x + 62, detail_y, val)
            detail_y -= d_spacing

        # Footer de la boleta del comprador
        f_box_y = y + 8
        f_box_h = 16
        c.setFillColor(colors.white)
        c.setStrokeColor(GRIS_BORDE)
        c.setLineWidth(0.6)
        c.roundRect(cuerpo_x + 6, f_box_y, cuerpo_inner_w - 12, f_box_h, 3, fill=1, stroke=1)

        c.setFillColor(AZUL_DIBA)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(cuerpo_x + 12, f_box_y + 5, "VENDEDOR (DEPORTISTA):")
        c.setFont("Helvetica", 6.5)
        c.setFillColor(GRIS_TEXTO)
        c.drawString(cuerpo_x + 120, f_box_y + 5, "________________________________________")

        c.setFont("Helvetica-Bold", 6.5)
        c.setFillColor(AZUL_DIBA)
        c.drawRightString(cuerpo_x + cuerpo_inner_w - 14, f_box_y + 5, f"TALONARIO #{nino_asignado:02d} • DIBA FBC")

        c.restoreState()

        # Línea de corte entre boletas horizontales
        if pos_on_page < boletas_por_pagina - 1 and (num_int + 1) < TOTAL_NUMEROS:
            cut_y = y - (gap_y / 2)
            c.saveState()
            c.setStrokeColor(colors.HexColor("#cbd5e1"))
            c.setLineWidth(0.5)
            c.setDash([4, 4])
            c.line(margin_x, cut_y, margin_x + ticket_w, cut_y)
            c.restoreState()

    c.save()
    print(f"[OK] 100 Boletas individuales con talón creadas en: {pdf_path}")

if __name__ == "__main__":
    pdf_100 = os.path.join(REPO_DIR, "public", "Boletas_Rifa_100_Numeros_Talon.pdf")
    generar_boletas_100_individuales(pdf_100)
    
    # Copiar a la carpeta principal para acceso inmediato
    dest_100 = os.path.join(BASE_DIR, "Boletas_Rifa_100_Numeros_Talon.pdf")
    shutil.copyfile(pdf_100, dest_100)
    print(f"[OK] Copia lista en: {dest_100}")
