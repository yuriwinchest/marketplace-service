
export function Footer() {
    return (
        <footer className="footer">
            <div className="footerContent">
                <div className="footerSection">
                    <h3>Yuri Winchester</h3>
                    <p className="role">Desenvolvedor Full Stack</p>
                    <p className="specialization">Especializado em Soluções para Saúde, Comércio e Sistemas Empresariais Personalizados</p>
                    <p className="description">
                        Transformo desafios complexos em soluções tecnológicas robustas e escaláveis.
                        Com experiência em desenvolvimento de sistemas completos, desde a arquitetura até a implementação,
                        entrego produtos que fazem a diferença no seu negócio.
                    </p>
                    <a href="https://www.yuriwinchester.com.br" target="_blank" rel="noopener noreferrer" className="websiteLink">
                        www.yuriwinchester.com.br
                    </a>
                </div>

                <div className="footerSection">
                    <h3>Informações de Contato</h3>
                    <div className="contactItem">
                        <div className="contactIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        </div>
                        <div>
                            <strong>Email</strong>
                            <a href="mailto:yuriallmeida@gmail.com" className="contactLink">yuriallmeida@gmail.com</a>
                        </div>
                    </div>
                    <div className="contactItem">
                        <div className="contactIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        </div>
                        <div>
                            <strong>WhatsApp</strong>
                            <a href="https://wa.me/5561993521849" target="_blank" rel="noopener noreferrer" className="contactLink">+55 61 99352-1849</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footerBottom">
                <p>&copy; {new Date().getFullYear()} Yuri Winchester. Todos os direitos reservados.</p>
            </div>
        </footer>
    )
}
