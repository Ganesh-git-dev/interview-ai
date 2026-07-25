from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session

from app.models.session import Session as InterviewSession
from app.models.answer import Answer
from app.models.analytics import Analytics
from app.models.recommendation import Recommendation
from app.models.user import User


class ReportGeneratorService:
    """Service for generating PDF reports."""

    async def generate_pdf(
        self,
        session_id: int,
        db: Session,
        user: User
    ) -> BytesIO:
        """Generate a professional PDF report."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)

        # Get data
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        answers = db.query(Answer).filter(Answer.session_id == session_id).all()
        analytics = db.query(Analytics).filter(Analytics.session_id == session_id).first()
        recommendations = db.query(Recommendation).filter(Recommendation.session_id == session_id).all()

        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20
        )

        # Content
        content = []

        # Title
        content.append(Paragraph("InterviewAI Pro - Feedback Report", title_style))
        content.append(Spacer(1, 20))

        # Candidate Info
        content.append(Paragraph(f"Candidate: {user.full_name or user.email}", styles['Normal']))
        content.append(Paragraph(f"Role: {session.jd_parsed.get('role_title', 'N/A')}", styles['Normal']))
        content.append(Paragraph(f"Date: {session.created_at.strftime('%B %d, %Y')}", styles['Normal']))
        content.append(Spacer(1, 20))

        # Overall Score
        if answers:
            overall_score = sum(a.overall_score or 0 for a in answers) / len(answers)
            tech_avg = sum(a.technical_score or 0 for a in answers) / len(answers)
            comm_avg = sum(a.communication_score or 0 for a in answers) / len(answers)
        else:
            overall_score = tech_avg = comm_avg = 0

        content.append(Paragraph("Overall Performance", heading_style))

        score_data = [
            ['Metric', 'Score'],
            ['Overall Score', f'{overall_score:.1f}/100'],
            ['Technical Average', f'{tech_avg:.1f}/100'],
            ['Communication Average', f'{comm_avg:.1f}/100'],
            ['Recommendation', session.recommendation or 'Pending']
        ]

        score_table = Table(score_data, colWidths=[2*inch, 2*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        content.append(score_table)
        content.append(Spacer(1, 30))

        # Question-by-Question Results
        content.append(Paragraph("Question-by-Question Results", heading_style))

        for i, answer in enumerate(answers, 1):
            question = answer.question
            content.append(Paragraph(f"Q{i}: {question.question_text[:100]}...", styles['Normal']))
            content.append(Paragraph(f"Score: {answer.overall_score}/100", styles['Normal']))
            content.append(Paragraph(f"Feedback: {answer.feedback_text[:200]}...", styles['Normal']))
            content.append(Spacer(1, 10))

        # Recommendations
        if recommendations:
            content.append(Paragraph("Recommended PWNDORA Labs", heading_style))

            for rec in recommendations:
                content.append(Paragraph(
                    f"• {rec.lab_name} ({rec.lab_domain}) - {rec.estimated_hours} hours - Priority: {rec.priority}",
                    styles['Normal']
                ))

        # Build PDF
        doc.build(content)
        buffer.seek(0)

        return buffer
