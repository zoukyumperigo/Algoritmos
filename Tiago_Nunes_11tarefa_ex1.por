programa {
  inteiro numint
  funcao inicio() {

    escreva("Digite um número natural de 1 a 10.\n")
    leia(numint)

    se(numint>0 e numint<=10 ) escreva(numint," é válido.\n")
    senao{
      escreva(numint,"é inválido.\n Digite novamente um número natural de 1 a 10\n")
      leia(numint)

    }

    para(inteiro i=1;i<11;i++ ){
      escreva(numint,"X",i,"=",numint*i,"\n")

    }


    
  }
}
