-- DELETA AS TABELAS E TIPOS ANTIGOS SE ELES EXISTIREM, PARA GARANTIR UM ESTADO LIMPO
-- A ordem é a inversa da criação para respeitar as dependências.
DROP TABLE IF EXISTS log_atividades CASCADE;
DROP TABLE IF EXISTS anexos_demandas CASCADE;
DROP TABLE IF EXISTS demandas CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS correspondentes_servicos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;

DROP TYPE IF EXISTS TIPO_USUARIO_CORRESPONDENTE;
DROP TYPE IF EXISTS STATUS_DILIGENCIA;
DROP TYPE IF EXISTS TIPO_LOG_ATIVIDADE;


-- RECRIA OS TIPOS PERSONALIZADOS (ENUMS)
CREATE TYPE TIPO_USUARIO_CORRESPONDENTE AS ENUM ('Advogado', 'Preposto');
CREATE TYPE STATUS_DILIGENCIA AS ENUM ('Pendente', 'Em Andamento', 'Cumprida', 'Cancelada');
CREATE TYPE TIPO_LOG_ATIVIDADE AS ENUM ('CRIACAO', 'ATUALIZACAO', 'MUDANCA_STATUS', 'COMENTARIO', 'UPLOAD_ANEXO');

-- A normalized address table reduces data duplication and ensures consistency.
-- It can be linked to any other entity (clientes, correspondentes).
CREATE TABLE enderecos (
    id SERIAL PRIMARY KEY,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profile tables now include robust fields and link to the normalized address table.
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    escritorio VARCHAR(255),
    telefone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    endereco_id INTEGER REFERENCES enderecos(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE correspondentes_servicos (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    tipo TIPO_USUARIO_CORRESPONDENTE NOT NULL,
    oab VARCHAR(20) UNIQUE,
    rg VARCHAR(20) UNIQUE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(50) NOT NULL,
    endereco_id INTEGER REFERENCES enderecos(id) ON DELETE SET NULL,
    comarcas_atendidas TEXT NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- A CHECK constraint ensures that if the user is an 'Advogado', the OAB field must be filled.
    CONSTRAINT chk_oab_if_advogado CHECK (
        (tipo = 'Advogado' AND oab IS NOT NULL AND oab <> '') OR (tipo <> 'Advogado')
    )
);

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Main 'demandas' table, now more robust and linked to the new structure.
CREATE TABLE demandas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao_completa TEXT NOT NULL,
    numero_processo VARCHAR(255),
    tipo_demanda VARCHAR(100),
    prazo_fatal DATE,
    status STATUS_DILIGENCIA NOT NULL DEFAULT 'Pendente',
    -- Financial columns
    valor_proposto_cliente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    valor_pago_correspondente NUMERIC(12, 2) DEFAULT 0,
    custas_extras NUMERIC(12, 2) DEFAULT 0,
    -- Foreign keys with clear ON DELETE rules
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT, -- Prevents deleting a client with active demands.
    correspondente_id INTEGER REFERENCES correspondentes_servicos(id) ON DELETE SET NULL,
    admin_responsavel_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    -- Auditing columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for file attachments, essential for a complete system.
CREATE TABLE anexos_demandas (
    id SERIAL PRIMARY KEY,
    demanda_id INTEGER NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    uploader_id INTEGER NOT NULL, -- Could be a client, correspondent or admin ID. Polymorphism handled at app level.
    uploader_perfil VARCHAR(20) NOT NULL, -- 'cliente', 'correspondente', 'admin'
    nome_original VARCHAR(255) NOT NULL,
    path_armazenamento VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanho_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table to track every important action in the system.
CREATE TABLE log_atividades (
    id BIGSERIAL PRIMARY KEY,
    demanda_id INTEGER REFERENCES demandas(id) ON DELETE CASCADE,
    ator_id INTEGER NOT NULL,
    ator_perfil VARCHAR(20) NOT NULL,
    tipo_log TIPO_LOG_ATIVIDADE NOT NULL,
    detalhes JSONB, -- Using JSONB is powerful for storing structured log data.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE --
-- Index foreign keys and frequently queried columns.
CREATE INDEX idx_demandas_cliente_id ON demandas(cliente_id);
CREATE INDEX idx_demandas_correspondente_id ON demandas(correspondente_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_prazo_fatal ON demandas(prazo_fatal);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_correspondentes_email ON correspondentes_servicos(email);
CREATE INDEX idx_correspondentes_cpf ON correspondentes_servicos(cpf);
