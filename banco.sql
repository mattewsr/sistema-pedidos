-- Tabela de Clientes (com melhorias)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(200),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Produtos (com melhorias)
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco > 0),
    estoque INT NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    categoria VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Pedidos (com melhorias)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO')),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    forma_pagamento VARCHAR(50),
    endereco_entrega VARCHAR(200)
);

-- Tabela de Itens do Pedido (com melhorias)
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    id_produto INT NOT NULL REFERENCES produtos(id),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario > 0),
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
    UNIQUE (id_pedido, id_produto) -- Evita duplicação de produtos no mesmo pedido
);

-- Gatilho para atualizar o total do pedido
CREATE OR REPLACE FUNCTION atualizar_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM itens_pedido
        WHERE id_pedido = COALESCE(NEW.id_pedido, OLD.id_pedido)
    )
    WHERE id = COALESCE(NEW.id_pedido, OLD.id_pedido);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_atualizar_total_pedido
AFTER INSERT OR UPDATE OR DELETE ON itens_pedido
FOR EACH ROW EXECUTE FUNCTION atualizar_total_pedido();