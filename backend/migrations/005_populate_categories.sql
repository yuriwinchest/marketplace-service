-- Inserir categorias variadas
insert into public.categories (name) values
-- Tecnologia e Design
('Desenvolvedor Web'), ('Desenvolvedor Mobile'), ('Criação de Sites'), ('Designer Gráfico'), ('UI/UX Designer'), 
('Editor de Vídeo'), ('Marketing Digital'), ('Gestor de Tráfego'), ('Social Media'), ('Técnico de Celular'), 
('Instalação de Redes'), ('Segurança Eletrônica'), ('Automação Residencial'), ('Recuperação de Dados'), ('SEO'),

-- Reformas e Construção
('Marceneiro'), ('Serralheiro'), ('Vidraceiro'), ('Gesseiro'), ('Piscineiro'), ('Paisagista'), ('Dedetizador'), 
('Desentupidor'), ('Marido de Aluguel'), ('Tapeceiro'), ('Decorador'), ('Arquiteto'), ('Engenheiro Civil'), 
('Mestre de Obras'), ('Telhadista'), ('Calheiro'), ('Impermeabilizador'), ('Azulejista'), ('Instalador de Piso'),

-- Serviços Domésticos
('Empregada Doméstica'), ('Babá'), ('Cozinheira'), ('Motorista Particular'), ('Cuidador de Idosos'), 
('Passadeira'), ('Lavadeira'), ('Organizador Pessoal'), ('Limpeza de Estofados'), ('Limpeza Pós-Obra'),

-- Pets
('Passeador de Cães'), ('Adestrador'), ('Banho e Tosa'), ('Veterinário em Domicílio'), ('Hospedagem Pet'),

-- Aulas e Ensino
('Professor de Inglês'), ('Professor de Espanhol'), ('Professor de Matemática'), ('Professor de Português'), 
('Professor de Música'), ('Professor de Piano'), ('Professor de Violão'), ('Reforço Escolar'), ('Aulas de Informática'),

-- Saúde e Bem-estar
('Personal Trainer'), ('Instrutor de Yoga'), ('Professor de Dança'), ('Psicólogo'), ('Nutricionista'), 
('Fisioterapeuta'), ('Fonoaudiólogo'), ('Enfermeira'), ('Massagista'), ('Terapeuta Holístico'),

-- Beleza e Estética
('Cabeleireira'), ('Manicure e Pedicure'), ('Maquiadora'), ('Esteticista'), ('Barbeiro'), ('Depiladora'), 
('Designer de Sobrancelhas'), ('Micropigmentadora'), ('Podóloga'),

-- Eventos
('Fotógrafo'), ('Filmagem de Eventos'), ('Buffet'), ('DJ'), ('Banda para Festas'), ('Barman'), 
('Cerimonialista'), ('Decorador de Festas'), ('Confeiteira'), ('Bolo e Doces'), ('Salgados para Festas'), 
('Aluguel de Brinquedos'), ('Garçom'), ('Segurança de Eventos'),

-- Veículos
('Mecânico Automotivo'), ('Funilaria e Pintura'), ('Eletricista de Autos'), ('Lavagem Automotiva'), 
('Martelinho de Ouro'), ('Instalação de Som Automotivo'), ('Mecânico de Motos'), ('Guincho'),

-- Consultoria e Serviços Gerais
('Contador'), ('Advogado'), ('Tradutor'), ('Redator'), ('Consultor Financeiro'), ('Detetive Particular'), 
('Costureira'), ('Sapateiro'), ('Chaveiro 24h'), ('Entregador'), ('Motoboy'), ('Mudanças e Carretos')
on conflict (name) do nothing;
