import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  address: string;
  profession: string;
  admission_date: string;
  status: string;
}

export const exportToPDF = (members: Member[], title: string) => {
  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.setTextColor(0, 122, 47);
  doc.text(title, 14, 22);
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 32);
  
  // Tableau
  const tableColumn = ["N° membre", "Nom", "Prénom", "Email", "Téléphone", "Date adhésion"];
  const tableRows = members.map(member => [
    member.member_number,
    member.last_name,
    member.first_name,
    member.email || "-",
    member.phone || "-",
    new Date(member.admission_date).toLocaleDateString('fr-FR')
  ]);
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'striped',
    headStyles: { fillColor: [0, 122, 47], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [242, 242, 242] },
  });
  
  doc.save(`prolife_${title.toLowerCase().replace(/ /g, '_')}.pdf`);
};

export const exportToExcel = (members: Member[], title: string) => {
  const data = members.map(member => ({
    'N° membre': member.member_number,
    'Nom': member.last_name,
    'Prénom': member.first_name,
    'Email': member.email,
    'Téléphone': member.phone,
    'Sexe': member.gender === 'M' ? 'Homme' : member.gender === 'F' ? 'Femme' : 'Autre',
    'Date de naissance': member.birth_date ? new Date(member.birth_date).toLocaleDateString('fr-FR') : '-',
    'Adresse': member.address || '-',
    'Profession': member.profession || '-',
    "Date d'adhésion": new Date(member.admission_date).toLocaleDateString('fr-FR'),
    'Statut': member.status === 'actif' ? 'Actif' : 'Inactif',
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  XLSX.writeFile(wb, `prolife_${title.toLowerCase().replace(/ /g, '_')}.xlsx`);
};