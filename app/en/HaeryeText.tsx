type HaeryeTextProps = {
  children: string;
  className?: string;
  vertical?: boolean;
};

const HANGEUL_OR_ARCHAIC = /[가-힣ㄱ-ㅎㅏ-ㅣㆍㆁ]/;

export default function HaeryeText({ children, className, vertical = false }: HaeryeTextProps) {
  return (
    <span className={`gs-haerye-text ${vertical ? 'gs-haerye-vertical' : ''} ${className ?? ''}`}>
      {Array.from(children).map((char, index) => {
        if (char === '\n') {
          return <br key={`${char}-${index}`} />;
        }

        if (char === ' ') {
          return <span key={`${char}-${index}`} className="gs-haerye-space" aria-hidden="true" />;
        }

        if (!HANGEUL_OR_ARCHAIC.test(char)) {
          return <span key={`${char}-${index}`}>{char}</span>;
        }

        return (
          <span key={`${char}-${index}`} className="gs-haerye-letter">
            {char}
          </span>
        );
      })}
    </span>
  );
}
