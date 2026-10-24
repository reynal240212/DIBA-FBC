import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, inch
from reportlab.pdfgen import canvas

# Colors DIBA FBC
AZUL_DIBA = colors.HexColor("#004d98")
DORADO_DIBA = colors.HexColor("#FFD700")
DORADO_OSCURO = colors.HexColor("#D4AF37")
AZUL_OSCURO = colors.HexColor("#002a54")
GRIS_CLARO = colors.HexColor("#f8fafc")
GRIS_LINEA = colors.HexColor("#cbd5e1")

LOGO_PATH = r"c:\Users\INVESTIGACION 181\Desktop\DIBA\DIBA-FBC\public\images\ESCUDO.png"

def create_planillas_pdf(output_path):
    """
    Genera las planillas de control para cada uno de los 17 niños.
    Cada niño tiene 6 números asignados (el último tiene 4 para completar 100 números).
    Incluye filas para comprador, teléfono y casilla de pago.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=1.2 * cm,
        rightMargin=1.2 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ClubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=AZUL_DIBA,
        alignment=1 # Center
    )
    sub_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=DORADO_OSCURO,
        alignment=1
    )
    info_style = ParagraphStyle(
        'InfoText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.black
    )
    bold_info_style = ParagraphStyle(
        'BoldInfoText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=AZUL_DIBA
    )
    num_box_style = ParagraphStyle(
        'NumBox',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=AZUL_DIBA,
        alignment=1
    )

    # 100 números (00 al 99) repartidos en 17 niños
    # 16 niños con 6 números (96) + 1 niño con 4 números (4)
    story = []
    total_numeros = 100
    nums_per_kid = 6
    kids = []
    
    current = 0
    kid_num = 1
    while current < total_numeros:
        count = min(nums_per_kid, total_numeros - current)
        nums = [f"{i:02d}" for i in range(current, current + count)]
        kids.append((kid_num, nums))
        current += count
        kid_num += 1

    # 2 planillas por página para que sea amplio y fácil de escribir
    for idx, (k_num, nums) in enumerate(kids):
        # Header del niño
        kid_header = [
            [
                Paragraph("<b>CLUB DEPORTIVO DIBA FBC</b><br/><font size=8 color='#004d98'>NIT / PERSONERÍA DEPORTIVA — FORJANDO CAMPEONES</font>", title_style),
                Paragraph(f"<b>TALONARIO DE CONTROL #{k_num:02d}</b><br/><font size=8 color='#666'>META: ${len(nums)*2500:,}</font>", ParagraphStyle('HRight', parent=bold_info_style, alignment=2))
            ]
        ]
        t_header = Table(kid_header, colWidths=[12.5*cm, 5.5*cm])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))

        # Parametros de la rifa
        info_data = [
            [
                Paragraph("<b>MOTIVO:</b> RIFA PRO-INSCRIPCIÓN CAMPEONATO", bold_info_style),
                Paragraph("<b>FECHA:</b> LUNES 2 DE NOVIEMBRE DE 2026", bold_info_style)
            ],
            [
                Paragraph("<b>PREMIO:</b> UNA COLONIA ORIGINAL", bold_info_style),
                Paragraph("<b>SORTEO:</b> LOTERÍA SINUANO NOCHE (Últimas 2 Cifras)", bold_info_style)
            ],
            [
                Paragraph(f"<b>VALOR:</b> $2.500 POR NÚMERO | <b>NÚMEROS ASIGNADOS:</b> {len(nums)}", bold_info_style),
                Paragraph(f"<b>TOTAL A ENTREGAR:</b> ${len(nums)*2500:,} COP", ParagraphStyle('ValStyle', parent=bold_info_style, textColor=colors.HexColor('#047857')))
            ],
            [
                Paragraph("<b>NIÑO / DEPORTISTA RESPONSABLE:</b> ________________________________________________", bold_info_style),
                Paragraph("<b>TELÉFONO ACUDIENTE:</b> ____________________", bold_info_style)
            ]
        ]
        t_info = Table(info_data, colWidths=[11.5*cm, 6.5*cm])
        t_info.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
            ('BOX', (0,0), (-1,-1), 1, AZUL_DIBA),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))

        # Tabla de los números asignados al niño
        table_rows = [
            [
                Paragraph("<b>N°</b>", ParagraphStyle('H1', parent=bold_info_style, alignment=1)),
                Paragraph("<b>NOMBRE DEL COMPRADOR</b>", ParagraphStyle('H2', parent=bold_info_style, alignment=1)),
                Paragraph("<b>TELÉFONO / WHATSAPP</b>", ParagraphStyle('H3', parent=bold_info_style, alignment=1)),
                Paragraph("<b>VALOR</b>", ParagraphStyle('H4', parent=bold_info_style, alignment=1)),
                Paragraph("<b>PAGÓ</b>", ParagraphStyle('H5', parent=bold_info_style, alignment=1))
            ]
        ]

        for n in nums:
            table_rows.append([
                Paragraph(f"<b>{n}</b>", num_box_style),
                Paragraph("", info_style), # Renglón en blanco para escribir a mano
                Paragraph("", info_style),
                Paragraph("$2.500", ParagraphStyle('CVal', parent=info_style, alignment=1)),
                Paragraph("[  ]", ParagraphStyle('Chk', parent=info_style, alignment=1))
            ])

        t_rows = Table(table_rows, colWidths=[1.6*cm, 9.4*cm, 4.2*cm, 1.8*cm, 1.0*cm], rowHeights=[18] + [22]*len(nums))
        t_rows.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), AZUL_DIBA),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, AZUL_DIBA),
            ('BACKGROUND', (0,1), (0,-1), colors.HexColor('#fef3c7')), # Dorado suave para la columna del número
            ('BACKGROUND', (3,1), (3,-1), colors.HexColor('#f8fafc')),
            ('ALIGN', (3,1), (4,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ]))

        # Reemplazar encabezados de tabla con texto blanco
        for c in range(5):
            t_rows.setStyle(TableStyle([
                ('TEXTCOLOR', (c,0), (c,0), colors.white)
            ]))

        block = [
            t_header,
            Spacer(1, 4),
            t_info,
            Spacer(1, 4),
            t_rows,
            Spacer(1, 6),
            Paragraph("<i>* Entregar el dinero recaudado y este talón diligenciado a más tardar el domingo 1 de noviembre. ¡Muchas gracias por apoyar al equipo!</i>", ParagraphStyle('Notice', parent=info_style, fontSize=7, textColor=colors.HexColor('#64748b'), alignment=1)),
            Spacer(1, 8),
            HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94a3b8'), spaceAfter=8, dash=[4, 3])
        ]

        story.append(KeepTogether(block))

        # 2 talonarios por página
        if idx % 2 == 1 and idx < len(kids) - 1:
            story.append(PageBreak())

    doc.build(story)
    print(f"[OK] Planillas de control creadas en: {output_path}")

if __name__ == "__main__":
    out_pdf = r"c:\Users\INVESTIGACION 181\Desktop\DIBA\DIBA-FBC\public\Planillas_Control_Rifa_DIBA_FBC.pdf"
    create_planillas_pdf(out_pdf)
