import React from 'react';
import { Company, buildingColors } from '../data/companyData';
import { Building2, User, Sparkles, Link } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
}

const keywords = {
  ability: ["无人机","AI","巡检","培训","设计","平台","智能制造","低空","检测","AIGC"],
  need: ["客户资源","应用场景","融资","渠道","政企合作","院校","产业合作","供应链","市场拓展"],
};

function tagsFor(text: string, type: 'ability' | 'need'): string[] {
  return keywords[type].filter(k => text.includes(k)).slice(0, 3);
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const buildingColor = buildingColors[company.building] || '#163b3b';

  return (
    <div
      onClick={() => onClick(company)}
      style={{
        border: '1px solid var(--line)',
        borderRadius: 18,
        padding: 18,
        background: 'white',
        cursor: 'pointer',
        transition: '0.18s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.55)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 30px rgba(22,59,59,.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14, lineHeight: 1.35 }}>{company.name}</h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, fontSize: 11, color: 'var(--muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Building2 size={11} />
          {company.building !== '-' ? `${company.building}号楼` : '楼栋待确认'}
        </span>
      </div>

      {company.capability && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <Sparkles size={11} color="#087d76" />
            <span style={{ fontSize: 11, color: '#087d76', fontWeight: 700 }}>供应能力</span>
          </div>
          <p style={{
            margin: 0, fontSize: 11, color: '#536966', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            paddingLeft: 16,
          }}>
            {company.capability}
          </p>
        </div>
      )}

      {company.demand && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <Link size={11} color="#ad4f27" />
            <span style={{ fontSize: 11, color: '#ad4f27', fontWeight: 700 }}>链接需求</span>
          </div>
          <p style={{
            margin: 0, fontSize: 11, color: '#536966', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            paddingLeft: 16,
          }}>
            {company.demand}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
        {tagsFor(company.capability, 'ability').slice(0, 2).map(t => (
          <span key={t} style={{ fontSize: 9, padding: '4px 7px', borderRadius: 999, background: '#edf3e7', color: '#54702c' }}>{t}</span>
        ))}
        {tagsFor(company.demand, 'need').slice(0, 1).map(t => (
          <span key={t} style={{ fontSize: 9, padding: '4px 7px', borderRadius: 999, background: '#fff0e8', color: '#ad4f27' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
