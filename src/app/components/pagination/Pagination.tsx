// import { ChevronLeft, ChevronRight } from "lucide-react";

// const Pagination = ({ currentPage, totalPages, onPageChange }:{currentPage:number,totalPages:number,onPageChange:(num:number)=>void}) => {
//   const getPageNumbers = () => {
//     const pages = [];
//     const showEllipsis = totalPages > 7;
    
//     if (!showEllipsis) {
//       // Show all pages if 7 or fewer
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//       return pages;
//     }
    
//     // Always show first page
//     pages.push(1);
    
//     if (currentPage <= 3) {
//       // Near the start: 1 2 3 4 ... 10
//       for (let i = 2; i <= 4; i++) {
//         pages.push(i);
//       }
//       pages.push('ellipsis-end');
//       pages.push(totalPages);
//     } else if (currentPage >= totalPages - 2) {
//       // Near the end: 1 ... 7 8 9 10
//       pages.push('ellipsis-start');
//       for (let i = totalPages - 3; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       // In the middle: 1 ... 4 5 6 ... 10
//       pages.push('ellipsis-start');
//       for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//         pages.push(i);
//       }
//       pages.push('ellipsis-end');
//       pages.push(totalPages);
//     }
    
//     return pages;
//   };

//   const pages = getPageNumbers();

//   return (
//     <div className="flex items-center gap-1">
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         aria-label="Previous page"
//       >
//         <ChevronLeft className="w-4 h-4" />
//       </button>

//       {pages.map((page, idx) => {
//         if (typeof page === 'string') {
//           return (
//             <span
//               key={`${page}-${idx}`}
//               className="px-3 py-2 text-gray-500"
//             >
//               ...
//             </span>
//           );
//         }

//         return (
//           <button
//             key={page}
//             onClick={() => onPageChange(page)}
//             className={`px-4 py-2 rounded-lg border transition-colors ${
//               currentPage === page
//                 ? 'bg-blue-600 text-white border-blue-600'
//                 : 'border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             {page}
//           </button>
//         );
//       })}

//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         aria-label="Next page"
//       >
//         <ChevronRight className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };


"use client";
export function generatePagination(current: number, total: number) {
  const pages: (number | "...")[] = [];
  const p1 = pages;
console.log("first",p1);
// Always show page 1
if (current > 2) pages.push(1);
if (current > 3) pages.push("...");
const p2 = pages;
console.log("m",p2);
console.log("s",pages);

// Show middle window (current -1, current, current +1)
for (let i = current - 1; i <= current + 1; i++) {
    if (i > 0 && i <= total) pages.push(i);
}
const p3 = pages;
console.log("t",p3);
    console.log("t",pages);
    
    // After window
    if (current < total - 2) pages.push("...");
    if (current < total - 1) pages.push(total);
    
    console.log("l",pages);
  return pages;
}
// export default generatePagination;



export default function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pageList = generatePagination(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Previous */}
      <button
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        Prev
      </button>

      {/* Page numbers */}
      {pageList.map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === "number" && onChange(page)}
          disabled={page === "..."}
          className={`px-3 py-1 border rounded ${
            page === currentPage ? "bg-primary text-white" : ""
          } disabled:opacity-40`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onChange(currentPage + 1)}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
