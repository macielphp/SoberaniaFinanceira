import { Account } from '../database/accounts';
import { Category } from '../database/categories';
import { AccountService } from './AccountService';
import { Operation } from './FinanceService';
import { Nature, State } from './FinanceService';

export interface FieldState {
  disabled: boolean;
  options: any[];
  message?: string;
  validation?: (value: any) => boolean;
}

export interface OperationFormState {
  natureza: FieldState;
  estado: FieldState;
  categoria: FieldState;
  formaPagamento: FieldState;
  contaOrigem: FieldState;
  contaDestino: FieldState;
  valor: FieldState;
  data: FieldState;
  detalhes: FieldState;
  recibo: FieldState;
  metas: FieldState;
}

export class OperationFormValidationService {
  /**
   * Estados disponíveis baseados na natureza
   */
  static getEstadosDisponiveis(natureza?: Nature): State[] {
    if (!natureza) return [];
    
    if (natureza === 'despesa') {
      return ['pago', 'pagar'];
    } else if (natureza === 'receita') {
      return ['recebido', 'receber'];
    }
    
    return [];
  }

  /**
   * Mapear estado para label amigável
   */
  static getEstadoLabel(estado: State): string {
    switch (estado) {
      case 'pago': return 'Pago';
      case 'pagar': return 'A Pagar';
      case 'recebido': return 'Recebido';
      case 'receber': return 'A Receber';
      default: return estado;
    }
  }

  /**
   * Categorias disponíveis baseadas na natureza e estado
   */
  static getCategoriasDisponiveis(
    natureza?: Nature, 
    estado?: State, 
    categorias: Category[] = []
  ): Category[] {
    if (!natureza || !estado) return [];
    
    // Mapear Nature para o tipo de categoria
    const categoryType = natureza === 'despesa' ? 'expense' : 'income';
    
    // Filtrar categorias pela natureza
    return categorias.filter(categoria => categoria.type === categoryType);
  }

  /**
   * Formas de pagamento disponíveis baseadas na categoria
   */
  static getFormasPagamentoDisponiveis(categoria?: string): string[] {
    if (!categoria) return [];
    
    const formasPagamento = [
      'Pix',
      'Cartão de crédito',
      'Cartão de débito', 
      'Dinheiro',
      'Boleto',
      'Depósito',
      'Transferência-bancária'
    ];
    
    // Se categoria é "Transferência", apenas transferência bancária
    if (categoria === 'Transferência') {
      return ['Transferência-bancária'];
    }
    
    // Para outras categorias, excluir transferência bancária
    return formasPagamento.filter(forma => forma !== 'Transferência-bancária');
  }

  /**
   * Contas origem disponíveis baseadas na natureza e forma de pagamento
   */
  static getContasOrigemDisponiveis(
    natureza?: Nature,
    formaPagamento?: string,
    contas: Account[] = []
  ): Account[] {
    if (!natureza || !formaPagamento) return [];
    
    // Para transferência bancária, apenas contas próprias
    if (formaPagamento === 'Transferência-bancária') {
      return contas.filter(conta => conta.type === 'propria');
    }
    
    // Para despesa, origem deve ser conta própria
    if (natureza === 'despesa') {
      return contas.filter(conta => conta.type === 'propria');
    }
    
    // Para receita, origem deve ser conta externa
    if (natureza === 'receita') {
      return contas.filter(conta => conta.type === 'externa');
    }
    
    return [];
  }

  /**
   * Contas destino disponíveis baseadas na conta origem e forma de pagamento
   */
  static getContasDestinoDisponiveis(
    contaOrigem?: Account,
    formaPagamento?: string,
    contas: Account[] = []
  ): Account[] {
    if (!contaOrigem || !formaPagamento) return [];
    
    // Para transferência bancária, apenas outras contas próprias
    if (formaPagamento === 'Transferência-bancária') {
      return contas.filter(conta => 
        conta.type === 'propria' && conta.id !== contaOrigem.id
      );
    }
    
    // Se conta origem é própria, destino deve ser externa
    if (contaOrigem.type === 'propria') {
      return contas.filter(conta => conta.type === 'externa');
    }
    
    // Se conta origem é externa, destino deve ser própria
    if (contaOrigem.type === 'externa') {
      return contas.filter(conta => conta.type === 'propria');
    }
    
    return [];
  }

  /**
   * Validação de data baseada no estado
   */
  static validarData(data: Date, estado?: State): boolean {
    if (!estado) return false;
    
    const dataAtual = new Date();
    const dataSelecionada = new Date(data);
    
    // Para estados pagos/recebidos, data não pode ser futura
    if (estado === 'pago' || estado === 'recebido') {
      return dataSelecionada <= dataAtual;
    }
    
    // Para estados pendentes, data não pode ser passada
    if (estado === 'pagar' || estado === 'receber') {
      return dataSelecionada >= dataAtual;
    }
    
    return true;
  }

  /**
   * Validação de saldo (futuro)
   */
  static validarSaldo(valor: number, contaOrigem?: Account, operacoes: Operation[] = []): boolean {
    if (!contaOrigem) return true;
    
    // Apenas validar para contas próprias
    if (contaOrigem.type !== 'propria') return true;
    
    const validation = AccountService.validateOperationBalance(contaOrigem, valor, operacoes);
    return validation.isValid;
  }

  /**
   * Gerar estado completo do formulário
   */
  static gerarEstadoFormulario(
    valores: {
      natureza?: Nature;
      estado?: State;
      categoria?: string;
      formaPagamento?: string;
      contaOrigem?: Account;
      contaDestino?: Account;
      valor?: number;
      data?: Date;
    },
    categorias: Category[] = [],
    contas: Account[] = [],
    operacoes: Operation[] = []
  ): OperationFormState {
    return {
      natureza: {
        disabled: false,
        options: ['despesa', 'receita'],
        message: 'Selecione a natureza da operação'
      },
      
      estado: {
        disabled: !valores.natureza,
        options: this.getEstadosDisponiveis(valores.natureza),
        message: valores.natureza ? 'Selecione o estado' : 'Selecione a natureza primeiro'
      },
      
      categoria: {
        disabled: !valores.estado,
        options: this.getCategoriasDisponiveis(valores.natureza, valores.estado, categorias),
        message: valores.estado ? 'Selecione a categoria' : 'Selecione o estado primeiro'
      },
      
      formaPagamento: {
        disabled: !valores.categoria,
        options: this.getFormasPagamentoDisponiveis(valores.categoria),
        message: valores.categoria ? 'Selecione a forma de pagamento' : 'Selecione a categoria primeiro'
      },
      
      contaOrigem: {
        disabled: !valores.formaPagamento,
        options: this.getContasOrigemDisponiveis(valores.natureza, valores.formaPagamento, contas),
        message: valores.formaPagamento ? 'Selecione a conta origem' : 'Selecione a forma de pagamento primeiro'
      },
      
      contaDestino: {
        disabled: !valores.contaOrigem,
        options: this.getContasDestinoDisponiveis(valores.contaOrigem, valores.formaPagamento, contas),
        message: valores.contaOrigem ? 'Selecione a conta destino' : 'Selecione a conta origem primeiro'
      },
      
      valor: {
        disabled: !valores.contaDestino,
        options: [],
        message: valores.contaDestino ? 'Digite o valor' : 'Selecione a conta destino primeiro',
        validation: valores.contaOrigem ? 
          (valor: number) => this.validarSaldo(valor, valores.contaOrigem, operacoes) :
          undefined
      },
      
      data: {
        disabled: !valores.valor,
        options: [],
        message: valores.valor ? 'Selecione a data' : 'Digite o valor primeiro',
        validation: valores.estado ? 
          (data: Date) => this.validarData(data, valores.estado) :
          undefined
      },
      
      detalhes: {
        disabled: !valores.data,
        options: [],
        message: valores.data ? 'Detalhes (opcional)' : 'Selecione a data primeiro'
      },
      
      recibo: {
        disabled: !valores.data,
        options: [],
        message: valores.data ? 'Recibo (opcional)' : 'Selecione a data primeiro'
      },
      
      metas: {
        disabled: !valores.data,
        options: [],
        message: valores.data ? 'Metas (opcional)' : 'Selecione a data primeiro'
      }
    };
  }

  /**
   * Validar se o formulário está completo
   */
  static validarFormularioCompleto(valores: any): boolean {
    return !!(
      valores.natureza &&
      valores.estado &&
      valores.categoria &&
      valores.formaPagamento &&
      valores.contaOrigem &&
      valores.contaDestino &&
      valores.valor &&
      valores.data
    );
  }

  /**
   * Obter mensagem de erro para um campo específico
   */
  static obterMensagemErro(
    campo: string,
    valor: any,
    estadoFormulario: OperationFormState
  ): string | null {
    const fieldState = estadoFormulario[campo as keyof OperationFormState];
    
    if (!fieldState) return null;
    
    if (fieldState.validation && !fieldState.validation(valor)) {
      switch (campo) {
        case 'data':
          return 'Data inválida para o estado selecionado';
        case 'valor':
          return 'Saldo insuficiente na conta origem';
        default:
          return 'Valor inválido';
      }
    }
    
    return null;
  }
} 