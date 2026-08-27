import React from 'react';

interface Company {
  id: number;
  name: string;
  industry: string;
  tags: string[];
  coreTech: string;
  description: string;
  seeking: string;
  logo: string;
}

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img
          src={company.logo}
          alt={company.name}
          className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-base truncate">{company.name}</div>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {company.industry}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {company.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">核心技术</span>
        <p className="text-sm text-gray-600 mt-0.5">{company.coreTech}</p>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{company.description}</p>

      <div className="bg-blue-50 rounded-lg p-2">
        <p className="text-sm text-blue-600">
          <span className="mr-1">🔍</span>
          <span className="font-medium">正在寻找：</span>
          {company.seeking}
        </p>
      </div>

      <button className="w-full mt-auto py-2 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
        查看企业
      </button>
    </div>
  );
}
