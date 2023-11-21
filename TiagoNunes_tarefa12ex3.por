programa {
  funcao inicio() {
    inteiro num_alunos,count=0,countm=0,countf=0,maisvelho=0,maisnovo=100,idade,opcao=1
    cadeia nome,nomemaisvelho,nomemaisnovo
    caracter sexo

    escreva("Digite o número de alunos da turma: ")
    leia(num_alunos)

    enquanto(count<num_alunos)
    
    {
      escreva(count+1,"º Aluno \n")
      escreva("Nome:\n")
      leia(nome)
      escreva("Idade:\n")
      
      leia(idade)
      se(idade>maisvelho) 
      {
        maisvelho=idade
        nomemaisvelho=nome
      }
      se(idade<maisnovo)
       {
        maisnovo = idade
        nomemaisnovo=nome}
      
      escreva("Sexo:\n")
      leia(sexo)
      se(sexo=="M" ou sexo=="m") countm++
      se(sexo=="F" ou sexo=="f") countf++

      count++





    }

    enquanto(opcao!=0){
    escreva("-----------MENU--------\n1-Aluno mais velho\n2-Aluno mais novo\n3-Nº alunos do sexo masculino\n4-Nº alunos do sexo femenino\n0-Sair\n")
    leia(opcao)
    escolha(opcao){
    caso 1:
    escreva("O aluno mais velho é o ",nomemaisvelho," com ",maisvelho," anos.\n")
    pare
    caso 2:
    escreva("O aluno mais novo é o ",nomemaisnovo," com ",maisnovo," anos.\n")
    pare
    caso 3:
    escreva("Existem ",countm," alunos do sexo masculino.\n")
    pare
    caso 4:
    escreva("Existem ",countf," alunos do sexo feminino.\n")
    pare
    caso 0:
    escreva("Obrigado até à próxima")
    pare
      }}

    }

  


    
  }

