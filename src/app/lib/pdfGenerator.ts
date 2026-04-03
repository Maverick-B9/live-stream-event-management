import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sport, Match, Franchise } from '../types';
import { format } from 'date-fns';

export function generateSportReport(sport: Sport, matches: Match[], franchises: Franchise[]) {
  const doc = new jsPDF();
  const sportMatches = matches.filter(m => m.sportId === sport.id);
  
  // Header
  doc.setFontSize(18);
  doc.text(`Official Report: ${sport.name} (${sport.gender === 'men' ? 'Men' : sport.gender === 'women' ? 'Women' : 'Mixed'})`, 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 28);
  doc.text(`Total Matches: ${sportMatches.length}`, 14, 34);

  // Matches Table
  const tableData = sportMatches.map(m => {
    const fA = franchises.find(f => f.id === m.franchiseAId)?.name || 'TBA';
    const fB = franchises.find(f => f.id === m.franchiseBId)?.name || 'TBA';
    
    // Quick score summary logic based on schema
    let scoreStr = 'N/A';
    if (m.status === 'completed' || m.status === 'live') {
      const pField = sport.scoringSchema.fields.find(fi => fi.isPrimary)?.key;
      if (pField) {
        const scoreA = m.scoreA?.[pField] || 0;
        const scoreB = m.scoreB?.[pField] || 0;
        scoreStr = `${scoreA} - ${scoreB}`;
      }
    } else {
        scoreStr = 'Upcoming';
    }

    const winnerId = m.winnerId;
    let resultStr = '-';
    if (winnerId === m.franchiseAId) resultStr = fA + ' Won';
    else if (winnerId === m.franchiseBId) resultStr = fB + ' Won';
    else if (m.status === 'completed') resultStr = 'Draw/Tie';
    
    return [
      format(new Date(m.dateTime), 'MMM d h:mm a'),
      `${fA} vs ${fB}`,
      m.venue || 'TBA',
      m.status.toUpperCase(),
      scoreStr,
      resultStr
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [['Date/Time', 'Matchup', 'Venue', 'Status', 'Main Score', 'Result']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(`${sport.name}_${sport.gender}_Report.pdf`);
}
