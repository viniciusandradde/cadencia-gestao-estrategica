import { formatTimestampBR } from '../lib/dates';
import { href } from '../router';

/** Aviso fixo: os dados ficam só neste aparelho e o backup é responsabilidade do usuário. */
export function DataNotice({ lastBackupAt, showLink = true }: { lastBackupAt: string | null; showLink?: boolean }) {
  return (
    <section className="notice" aria-labelledby="aviso-dados">
      <strong id="aviso-dados">Seus dados ficam só neste aparelho e neste navegador.</strong>
      <p>
        Nada é enviado para a internet. Se você limpar os dados do navegador, trocar de aparelho ou perder o celular,
        os registros se perdem. <b>Fazer backup é responsabilidade sua</b>: exporte o arquivo com frequência e guarde
        em outro lugar.
      </p>
      <p className="small">
        Último backup exportado: {lastBackupAt ? formatTimestampBR(lastBackupAt) : 'nunca'}.
        {showLink && (
          <>
            {' '}
            <a href={href('configuracoes')}>Fazer backup agora</a>
          </>
        )}
      </p>
    </section>
  );
}
