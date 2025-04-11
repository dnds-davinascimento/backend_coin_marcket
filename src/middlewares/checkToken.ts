import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";

// Interface para adicionar o campo 'user' ao objeto de requisição
interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

// Middleware para verificar o token
const checkToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Carregar configurações do .env
  config();

  // Extrair o token do header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ msg: "Token não fornecido" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT secret não está definido");
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded; // Atribui o payload decodificado ao objeto de requisição

    // Prossegue para o próximo middleware
    next();
  } catch (error) {
    console.log("Token inválido:", error);
    res.status(401).json({ msg: "Token inválido" });
  }
};

// Middleware para verificar as permissões de um usuário em relação a um recurso específico
const permissionsMiddleware = (recurso: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    

    if (!token) {
      res.status(401).json({ msg: "Acesso negado" });
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT secret is not defined");
      }
      
      const decoded = jwt.verify(token, secret) as JwtPayload;
     
      const usuario = decoded;

      // Verificação de permissões
      if (usuario.isAdmin) {
        
        next(); // Se for admin, passa ao próximo middleware
        return;
      }

      if (!usuario || !usuario.permissions) {
        
        res.status(403).json({ msg: "Usuário não tem permissões" });
        return;
      }

      const permissoesRecurso = usuario.permissions[recurso];
      if (!permissoesRecurso) {
        res.status(403).json({ msg: "Usuário não tem permissões para este recurso" });
        return;
      }

      if (req.method === "GET" && !permissoesRecurso.view) {
        res.status(403).json({ msg: "Usuário não tem permissões para visualizar este recurso" });
        return;
      }
      if (req.method === "POST" && !permissoesRecurso.create) {
        res.status(403).json({ msg: "Usuário não tem permissões para criar este recurso" });
        return;
      }
      if (req.method === "PUT" && !permissoesRecurso.edit) {
        res.status(403).json({ msg: "Usuário não tem permissões para editar este recurso" });
        return;
      }
      if (req.method === "DELETE" && !permissoesRecurso.delete) {
        res.status(403).json({ msg: "Usuário não tem permissões para excluir este recurso" });
        return;
      }

      // Se todas as permissões forem verificadas, continua
      next();
    } catch (error) {
      res.status(403).json({ msg: "Token inválido ou erro de autorização" });
    }
  };
};



export { checkToken, permissionsMiddleware };
