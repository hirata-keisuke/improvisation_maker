import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Score } from '@/types/rhythm'

export async function exportToPDF(score: Score): Promise<void> {
  const element = document.getElementById('interactive-staff-container')

  if (!element) {
    console.error('Staff container not found')
    return
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pdfWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    if (imgHeight <= pdfHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
    } else {
      const ratio = (pdfHeight - 20) / imgHeight
      const scaledWidth = imgWidth * ratio
      const scaledHeight = pdfHeight - 20
      pdf.addImage(imgData, 'PNG', 10, 10, scaledWidth, scaledHeight)
    }

    pdf.setProperties({
      title: score.title,
      subject: `Rhythm Score - BPM ${score.tempo}`,
      author: 'Adlib Maker',
      creator: 'Adlib Maker',
    })

    pdf.save(`${score.title || 'rhythm-score'}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('PDF出力に失敗しました')
  }
}
